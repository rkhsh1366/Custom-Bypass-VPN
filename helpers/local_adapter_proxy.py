#!/usr/bin/env python3
"""
AG AntiVPN Local Adapter Proxy Server for Windows
-------------------------------------------------
Receives bypassed traffic from the Chrome extension on port 8888 and routes it
through the physical network adapter (Wi-Fi/Ethernet), bypassing OpenVPN's TUN/TAP.
"""

import socket
import select
import threading
import sys
import os
import io

LISTEN_HOST = '127.0.0.1'
LISTEN_PORT = 8888
BUFFER_SIZE = 8192

# When running via pythonw.exe (no console), sys.stdout and sys.stderr are None.
# Redirect to devnull to prevent crashes on any print() call.
if sys.stdout is None:
    sys.stdout = open(os.devnull, 'w')
if sys.stderr is None:
    sys.stderr = open(os.devnull, 'w')

# Also write a log file next to the script for debugging
LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'proxy.log')

def safe_log(msg):
    try:
        line = str(msg)
        print(line, flush=True)
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(line + '\n')
    except Exception:
        pass

def get_physical_lan_ip():
    candidates = []
    try:
        hostname = socket.gethostname()
        addresses = socket.getaddrinfo(hostname, None, socket.AF_INET)
        for addr_info in addresses:
            ip = addr_info[4][0]
            if not ip.startswith('127.'):
                candidates.append(ip)
    except Exception:
        pass

    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('1.1.1.1', 80))
        connected_ip = s.getsockname()[0]
        s.close()
        if connected_ip not in candidates and not connected_ip.startswith('127.'):
            candidates.append(connected_ip)
    except Exception:
        pass

    safe_log(f"[INFO] Local IPs detected: {candidates}")

    for ip in candidates:
        if ip.startswith('192.168.') or ip.startswith('172.16.') or ip.startswith('172.20.'):
            return ip

    for ip in candidates:
        if not ip.startswith('10.8.') and not ip.startswith('10.7.'):
            return ip

    return candidates[0] if candidates else '0.0.0.0'


PHYSICAL_LAN_IP = get_physical_lan_ip()
safe_log(f"[OK] Physical LAN IP: {PHYSICAL_LAN_IP}")


def handle_client(client_socket, client_addr):
    remote_socket = None
    try:
        request = client_socket.recv(BUFFER_SIZE)
        if not request:
            client_socket.close()
            return

        lines = request.split(b'\r\n')
        first_line = lines[0].decode('iso-8859-1', errors='ignore')
        parts = first_line.split()

        if len(parts) < 2:
            client_socket.close()
            return

        method = parts[0]
        url = parts[1]

        # Health check endpoint for Chrome extension status check
        if '/ag-health-check' in url or method == 'OPTIONS':
            response_body = b'{"status":"ok","ip":"' + PHYSICAL_LAN_IP.encode('utf-8') + b'"}'
            response = (
                b"HTTP/1.1 200 OK\r\n"
                b"Content-Type: application/json\r\n"
                b"Access-Control-Allow-Origin: *\r\n"
                b"Access-Control-Allow-Methods: GET, POST, OPTIONS, CONNECT\r\n"
                b"Access-Control-Allow-Headers: *\r\n"
                b"Access-Control-Allow-Private-Network: true\r\n"
                b"Connection: close\r\n"
                b"Content-Length: " + str(len(response_body)).encode('utf-8') + b"\r\n"
                b"\r\n" + response_body
            )
            client_socket.sendall(response)
            client_socket.close()
            return

        target_host = ""
        target_port = 80

        if method == "CONNECT":
            if ":" in url:
                target_host, target_port_str = url.split(":", 1)
                target_port = int(target_port_str)
            else:
                target_host = url
                target_port = 443
        else:
            if url.startswith("http://"):
                url_clean = url[7:]
                host_path = url_clean.split("/", 1)[0]
                if ":" in host_path:
                    target_host, target_port_str = host_path.split(":", 1)
                    target_port = int(target_port_str)
                else:
                    target_host = host_path
                    target_port = 80
            else:
                for line in lines[1:]:
                    decoded = line.decode('iso-8859-1', errors='ignore')
                    if decoded.lower().startswith("host:"):
                        host_val = decoded.split(":", 1)[1].strip()
                        if ":" in host_val:
                            target_host, target_port_str = host_val.split(":", 1)
                            target_port = int(target_port_str)
                        else:
                            target_host = host_val
                            target_port = 80
                        break

        if not target_host:
            client_socket.close()
            return

        remote_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        remote_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

        try:
            if PHYSICAL_LAN_IP and PHYSICAL_LAN_IP != '0.0.0.0':
                remote_socket.bind((PHYSICAL_LAN_IP, 0))
        except Exception:
            pass

        remote_socket.connect((target_host, target_port))

        if method == "CONNECT":
            client_socket.sendall(b"HTTP/1.1 200 Connection Established\r\n\r\n")
        else:
            remote_socket.sendall(request)

        sockets = [client_socket, remote_socket]
        while True:
            readable, _, errorable = select.select(sockets, [], sockets, 60)
            if errorable or not readable:
                break
            for sock in readable:
                other = remote_socket if sock is client_socket else client_socket
                data = sock.recv(BUFFER_SIZE)
                if not data:
                    return
                other.sendall(data)
    except Exception:
        pass
    finally:
        try:
            client_socket.close()
        except Exception:
            pass
        if remote_socket:
            try:
                remote_socket.close()
            except Exception:
                pass


def start_proxy_server():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    try:
        server.bind((LISTEN_HOST, LISTEN_PORT))
    except Exception as e:
        safe_log(f"[ERROR] Port {LISTEN_PORT} in use or blocked: {e}")
        sys.exit(1)

    server.listen(100)
    safe_log(f"[SUCCESS] AG AntiVPN Proxy running on {LISTEN_HOST}:{LISTEN_PORT}")
    safe_log(f"[INFO] Outgoing interface: {PHYSICAL_LAN_IP}")

    while True:
        try:
            client_sock, client_addr = server.accept()
            t = threading.Thread(target=handle_client, args=(client_sock, client_addr), daemon=True)
            t.start()
        except KeyboardInterrupt:
            safe_log("Proxy stopped.")
            sys.exit(0)
        except Exception as e:
            safe_log(f"Error: {e}")

if __name__ == '__main__':
    # Clear old log
    try:
        with open(LOG_FILE, 'w') as f:
            f.write('')
    except Exception:
        pass
    start_proxy_server()

from PIL import Image, ImageDraw, ImageFont
import os
import math

def create_shield_icon(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    scale = size / 128.0

    # Draw rounded background badge with gradient
    for y in range(size):
        for x in range(size):
            factor = (y / size) * 0.7 + (x / size) * 0.3
            r = int(16 * (1 - factor) + 6 * factor)
            g = int(185 * (1 - factor) + 182 * factor)
            b = int(129 * (1 - factor) + 212 * factor)

            dx = max(0, abs(x - size/2) - (size/2 - 10*scale))
            dy = max(0, abs(y - size/2) - (size/2 - 10*scale))
            if dx*dx + dy*dy <= (10*scale)**2:
                img.putpixel((x, y), (r, g, b, 255))

    # Inner Dark Shield
    shield_pts = [
        (64 * scale, 20 * scale),
        (104 * scale, 36 * scale),
        (104 * scale, 72 * scale),
        (64 * scale, 108 * scale),
        (24 * scale, 72 * scale),
        (24 * scale, 36 * scale),
    ]
    draw.polygon(shield_pts, fill=(15, 23, 42, 240), outline=(255, 255, 255, 220), width=int(2*scale))

    # Lightning Bolt
    bolt_pts = [
        (68 * scale, 38 * scale),
        (46 * scale, 68 * scale),
        (62 * scale, 68 * scale),
        (56 * scale, 92 * scale),
        (82 * scale, 58 * scale),
        (66 * scale, 58 * scale),
    ]
    draw.polygon(bolt_pts, fill=(52, 211, 153, 255))

    return img


def draw_vector_globe(draw, cx, cy, radius, color):
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=color, width=2)
    draw.line([(cx - radius, cy), (cx + radius, cy)], fill=color, width=2)
    draw.line([(cx, cy - radius), (cx, cy + radius)], fill=color, width=2)
    draw.arc([cx - radius//2, cy - radius, cx + radius//2, cy + radius], 0, 360, fill=color, width=2)


def draw_vector_bolt(draw, cx, cy, scale, color):
    pts = [
        (cx + 2*scale, cy - 10*scale),
        (cx - 8*scale, cy + 1*scale),
        (cx - 1*scale, cy + 1*scale),
        (cx - 4*scale, cy + 10*scale),
        (cx + 8*scale, cy - 1*scale),
        (cx + 1*scale, cy - 1*scale),
    ]
    draw.polygon(pts, fill=color)


def draw_vector_gear(draw, cx, cy, radius, color):
    for i in range(8):
        angle = i * (math.pi / 4)
        x1 = cx + (radius + 2) * math.cos(angle)
        y1 = cy + (radius + 2) * math.sin(angle)
        draw.ellipse([x1-2, y1-2, x1+2, y1+2], fill=color)
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=color, width=2)
    draw.ellipse([cx - radius//2, cy - radius//2, cx + radius//2, cy + radius//2], fill=(30, 41, 59))


def draw_vector_check(draw, cx, cy, radius, color):
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=color)
    draw.line([(cx - radius//2, cy), (cx - 1, cy + radius//2)], fill=(255, 255, 255), width=2)
    draw.line([(cx - 1, cy + radius//2), (cx + radius//2, cy - radius//3)], fill=(255, 255, 255), width=2)


def generate_store_screenshot():
    width = 1280
    height = 800

    img = Image.new("RGB", (width, height), (15, 23, 42))
    draw = ImageDraw.Draw(img)

    # Background gradient
    for y in range(height):
        factor = y / height
        r = int(11 * (1 - factor) + 15 * factor)
        g = int(15 * (1 - factor) + 23 * factor)
        b = int(25 * (1 - factor) + 42 * factor)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Background ambient lighting glows
    draw.ellipse([600, -200, 1400, 600], fill=(16, 185, 129, 30))
    draw.ellipse([-200, 300, 600, 1000], fill=(59, 130, 246, 30))

    try:
        font_large = ImageFont.truetype("arialbd.ttf", 34)
        font_sub = ImageFont.truetype("arialbd.ttf", 18)
        font_card = ImageFont.truetype("arial.ttf", 15)
        font_bold = ImageFont.truetype("arialbd.ttf", 16)
        font_small = ImageFont.truetype("arial.ttf", 13)
        font_tiny = ImageFont.truetype("arial.ttf", 11)
    except Exception:
        font_large = font_sub = font_card = font_bold = font_small = font_tiny = ImageFont.load_default()

    # Left Side: Feature Highlights & Banner
    draw.text((80, 115), "Custom Bypass VPN", fill=(248, 250, 252), font=font_large)
    draw.text((80, 168), "Per-Tab & Domain VPN Bypass for Chrome", fill=(52, 211, 153), font=font_sub)

    features = [
        "1-Click VPN Bypass for Specific Sites",
        "Supports v2rayN, v2Box, OpenVPN & Windscribe",
        "Multi-Country TLD Bypasses (.IR, .RU, .CN, .TR, .BY)",
        "Real-time Status Badges on Active Tabs",
        "100% Local & Private Routing Engine"
    ]

    fy = 235
    for feat in features:
        draw.rounded_rectangle([80, fy, 570, fy + 50], radius=12, fill=(30, 41, 59, 210), outline=(255, 255, 255, 30))
        draw_vector_check(draw, 106, fy + 25, 10, (16, 185, 129))
        draw.text((130, fy + 15), feat, fill=(226, 232, 240), font=font_card)
        fy += 64

    # Right Side: Extension Popup Preview Window
    px1, py1, px2, py2 = 680, 70, 1160, 740

    draw.rounded_rectangle([px1+12, py1+12, px2+12, py2+12], radius=20, fill=(5, 8, 15, 180))
    draw.rounded_rectangle([px1, py1, px2, py2], radius=20, fill=(15, 23, 42, 245), outline=(52, 211, 153, 200), width=2)

    # Popup Header
    draw.rounded_rectangle([px1+16, py1+16, px2-16, py1+72], radius=12, fill=(30, 41, 59, 220), outline=(255, 255, 255, 20))
    
    icon_small = create_shield_icon(38)
    img.paste(icon_small, (px1 + 28, py1 + 25), icon_small)

    draw.text((px1 + 78, py1 + 26), "Custom Bypass VPN", fill=(248, 250, 252), font=font_bold)
    draw.text((px1 + 78, py1 + 48), "v1.0.0 (English)", fill=(148, 163, 184), font=font_tiny)

    draw.rounded_rectangle([px2 - 124, py1 + 32, px2 - 88, py1 + 56], radius=6, fill=(255, 255, 255, 20), outline=(255, 255, 255, 40))
    draw.text((px2 - 114, py1 + 37), "EN", fill=(248, 250, 252), font=font_tiny)
    
    draw.rounded_rectangle([px2 - 76, py1 + 32, px2 - 28, py1 + 56], radius=12, fill=(16, 185, 129))
    draw.ellipse([px2 - 48, py1 + 35, px2 - 31, py1 + 53], fill=(255, 255, 255))

    # Active Tab Card Section
    card_y = py1 + 84
    draw.rounded_rectangle([px1+16, card_y, px2-16, card_y + 195], radius=16, fill=(30, 41, 59, 180), outline=(255, 255, 255, 20))

    draw.text((px1 + 32, card_y + 14), "Active Tab Domain:", fill=(148, 163, 184), font=font_small)
    
    draw.rounded_rectangle([px2 - 176, card_y + 10, px2 - 32, card_y + 34], radius=10, fill=(16, 185, 129, 45), outline=(52, 211, 153))
    draw.text((px2 - 162, card_y + 14), "NO-VPN (BYPASSED)", fill=(52, 211, 153), font=font_tiny)

    draw.rounded_rectangle([px1 + 32, card_y + 44, px2 - 32, card_y + 94], radius=12, fill=(15, 23, 42, 230), outline=(255, 255, 255, 20))
    draw_vector_globe(draw, px1 + 56, card_y + 69, 10, (52, 211, 153))
    draw.text((px1 + 78, card_y + 60), "baam.bmi.ir", fill=(248, 250, 252), font=font_bold)

    draw.rounded_rectangle([px1 + 32, card_y + 108, px2 - 32, card_y + 158], radius=12, fill=(239, 68, 68))
    draw_vector_bolt(draw, px1 + 65, card_y + 133, 1.2, (255, 255, 255))
    draw.text((px1 + 90, card_y + 124), "Enable VPN For This Site", fill=(255, 255, 255), font=font_bold)

    # Regional TLDs Section
    q_y = card_y + 208
    draw.text((px1 + 20, q_y), "Regional Auto-Bypass (TLDs):", fill=(148, 163, 184), font=font_small)
    q_y += 24

    tld_items = [
        ("Bypass .IR (Iran)", True),
        ("Bypass .RU / .rf (Russia)", True),
        ("Bypass .CN (China)", False),
        ("Bypass .TR (Turkey)", False),
    ]

    for label, is_on in tld_items:
        draw.rounded_rectangle([px1+16, q_y, px2-16, q_y + 36], radius=10, fill=(30, 41, 59, 180), outline=(255, 255, 255, 15))
        draw.text((px1 + 30, q_y + 10), label, fill=(248, 250, 252), font=font_small)
        
        bg_col = (16, 185, 129) if is_on else (51, 65, 85)
        tx = 26 if is_on else 12
        draw.rounded_rectangle([px2 - 60, q_y + 8, px2 - 28, q_y + 28], radius=10, fill=bg_col)
        draw.ellipse([px2 - 60 + tx - 7, q_y + 11, px2 - 60 + tx + 7, q_y + 25], fill=(255, 255, 255))
        q_y += 42

    # Stats Row Card
    s_y = q_y + 8
    w_box = (px2 - px1 - 44) // 2
    
    draw.rounded_rectangle([px1+16, s_y, px1+16+w_box, s_y + 64], radius=12, fill=(30, 41, 59, 180), outline=(255, 255, 255, 20))
    draw.text((px1 + 32, s_y + 12), "14", fill=(52, 211, 153), font=font_bold)
    draw.text((px1 + 32, s_y + 36), "Custom Rules", fill=(148, 163, 184), font=font_small)

    draw.rounded_rectangle([px1+28+w_box, s_y, px2-16, s_y + 64], radius=12, fill=(30, 41, 59, 180), outline=(52, 211, 153))
    draw.ellipse([px1 + 44 + w_box, s_y + 18, px1 + 54 + w_box, s_y + 28], fill=(16, 185, 129))
    draw.text((px1 + 62 + w_box, s_y + 12), "Active", fill=(52, 211, 153), font=font_bold)
    draw.text((px1 + 44 + w_box, s_y + 36), "Helper Service Online", fill=(148, 163, 184), font=font_small)

    # Footer Link
    draw_vector_gear(draw, px1 + 78, py2 - 20, 6, (148, 163, 184))
    draw.text((px1 + 92, py2 - 27), "Advanced Settings & VPN Rules", fill=(148, 163, 184), font=font_small)

    # Save Screenshot PNG
    icons_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'icons')
    os.makedirs(icons_dir, exist_ok=True)
    screenshot_path = os.path.join(icons_dir, 'screenshot-1280x800.png')
    img.save(screenshot_path, "PNG")
    print(f"[OK] Generated clean vector store screenshot: {screenshot_path}")

    for sz in [16, 48, 128]:
        ic = create_shield_icon(sz)
        ic_path = os.path.join(icons_dir, f'icon-{sz}.png')
        ic.save(ic_path, "PNG")
        print(f"[OK] Generated high quality icon: {ic_path}")

if __name__ == '__main__':
    generate_store_screenshot()

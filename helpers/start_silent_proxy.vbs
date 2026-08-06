' AG AntiVPN - Silent Background Proxy Launcher
' Launches local_adapter_proxy.py hidden using pythonw.exe or python.exe
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
pyScript = fso.BuildPath(scriptDir, "local_adapter_proxy.py")

' Use the exact known Python path on this system
pythonwExe = ""
pythonExe = ""

' Check known user-local Python installation
userProfile = WshShell.ExpandEnvironmentStrings("%USERPROFILE%")
pyBase = userProfile & "\AppData\Local\Programs\Python"

If fso.FolderExists(pyBase) Then
    Set pyFolder = fso.GetFolder(pyBase)
    For Each subFold In pyFolder.SubFolders
        pw = fso.BuildPath(subFold.Path, "pythonw.exe")
        p = fso.BuildPath(subFold.Path, "python.exe")
        If fso.FileExists(pw) Then pythonwExe = pw
        If fso.FileExists(p) Then pythonExe = p
    Next
End If

' Choose pythonw (silent) if available, otherwise python
Dim exePath
If pythonwExe <> "" Then
    exePath = pythonwExe
ElseIf pythonExe <> "" Then
    exePath = pythonExe
Else
    exePath = "python"
End If

' Build command and run hidden (window style 0 = hidden)
cmd = """" & exePath & """ """ & pyScript & """"
WshShell.Run cmd, 0, False

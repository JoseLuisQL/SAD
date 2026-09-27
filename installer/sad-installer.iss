; Script de Instalación para Inno Setup
; Sistema Integrado de Archivos Digitales (SAD) - DISA Chincheros
; Cumple con directivas AGN y Ley 27269 de Firma Digital

#define MyAppName "SAD - Archivo Digital"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "DISA Chincheros - Gobierno Regional de Apurímac"
#define MyAppURL "https://disachincheros.gob.pe"
#define MyAppExeName "Iniciar-SAD-Escritorio.bat"

[Setup]
AppId={{9B78D82A-515A-4B69-9E6D-506B9C1E14B8}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName=C:\SAD
DefaultGroupName=SAD - Archivo Digital
DisableProgramGroupPage=yes
OutputDir=..\dist-installer
OutputBaseFilename=Instalador-SAD-Escritorio-v1.0
SetupIconFile=..\desktop\assets\icon.ico
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "..\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\backend\*"; DestDir: "{app}\backend"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "node_modules,uploads\documents\*,dist"
Source: "..\frontend\*"; DestDir: "{app}\frontend"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "node_modules,.next"
Source: "..\desktop\*"; DestDir: "{app}\desktop"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "node_modules,dist-installer"
Source: "..\AGENTS.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\INSTALACION-SERVIDOR-WINDOWS.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\AUDITORIA-SISTEMA-SAD.md"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\desktop\assets\icon.ico"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\desktop\assets\icon.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: shellexec postinstall skipifsilent

2026-01-24 07:19:44-6 | INFO 3  Log started.
2026-01-24 07:19:44-6 | INFO 4  Logger: '', level: INFO
2026-01-24 07:19:44-6 | INFO 5 LoggingService Runtime Information:
 - Build Info: BuildInfo(buildType: release, appVersion: 26.1.405.0)
 - Pid: 13884
 - Executable: C:\Windows\SystemTemp\updater_chrome_Unpacker_BeginUnzipping13372_725687747\installer_output979258524\GooglePlayGamesServicesInstaller.exe
 - Arguments: []
 - OS Version: "Windows 11 Home" 10.0 (Build 26200)
 - Dart Version: 3.12.0-32.0.dev (dev) (Thu Jan 15 08:03:31 2026 -0800) on "windows_x64"
 - Dart Build Id: 86c7304b96add146982d9e65d111ce40
 - Dart Crash Debug Id: 4B30C786AD9646D1982D9E65D111CE400
2026-01-24 07:19:44-6 | INFO 6 ServiceController Service running: Logging
2026-01-24 07:19:44-6 | INFO 7 ServiceController Service starting: CrashReporter
2026-01-24 07:19:44-6 | INFO 8 NativeCrashReporter Registering native crash handler for productVersion: 26.1.405.0, productId: Google_Desktop_Services
2026-01-24 07:19:44-6 | INFO 9 NativeCrashReporter Successfully registered native crash handler
2026-01-24 07:19:44-6 | INFO 10 ServiceController Service running: CrashReporter
2026-01-24 07:19:45-6 | INFO 11 ServiceController Service starting: MetricsRecorder
2026-01-24 07:19:45-6 | INFO 12 GdsOmahaCohortExperimentIdProvider No experiment ID found for cohort: "Production"
2026-01-24 07:19:46-6 | INFO 13 MetricsRecorderService Received new GPG app version: 26.1.54.0
2026-01-24 07:19:46-6 | INFO 14 ServiceController Service running: MetricsRecorder
2026-01-24 07:19:46-6 | INFO 15 ServiceController Service starting: SystemHealth
2026-01-24 07:19:46-6 | INFO 16 ServiceController Service running: SystemHealth
2026-01-24 07:19:46-6 | INFO 17 ServiceController Service starting: Installer
2026-01-24 07:19:46-6 | INFO 18 ServiceController Service running: Installer
2026-01-24 07:19:46-6 | INFO 19 ServiceGroupController Service group running: ApplicationServices
2026-01-24 07:19:46-6 | INFO 20 Application Program executing
2026-01-24 07:19:46-6 | INFO 21 Win32ServiceHelper Searching for service (serviceName: "GooglePlayGamesServices-25.12.281.0")
2026-01-24 07:19:46-6 | INFO 22 Win32ServiceHelper Found service (serviceName: "GooglePlayGamesServices-25.12.281.0", handle: 2355521084336)
2026-01-24 07:19:46-6 | INFO 23 Win32ServiceHelper Service "GooglePlayGamesServices-25.12.281.0" state: WindowsServiceState.SERVICE_RUNNING
2026-01-24 07:19:46-6 | INFO 24 PlayInstaller Previous version: VersionState {
  installDirectory=Directory: 'C:\Program Files\Google\Play Games Services\25.12.281.0',
  instanceId=25.12.281.0,
  serviceName=GooglePlayGamesServices-25.12.281.0,
  servicePath=C:\Program Files\Google\Play Games Services\25.12.281.0\Service\GooglePlayGamesServices.exe,
}
New version: VersionState {
  installDirectory=Directory: 'C:\Program Files\Google\Play Games Services\26.1.405.0',
  instanceId=26.1.405.0,
  serviceName=GooglePlayGamesServices-26.1.405.0,
  servicePath=C:\Program Files\Google\Play Games Services\26.1.405.0\Service\GooglePlayGamesServices.exe,
}
2026-01-24 07:19:46-6 | INFO 25 PlayInstaller Starting installation:
- status: upgrade from Directory: 'C:\Program Files\Google\Play Games Services\25.12.281.0'
- appId: "GooglePlayInstaller"
- version: 26.1.405.0
- installDirectory: "Directory: 'C:\Program Files\Google\Play Games Services\26.1.405.0'"
- serviceName: "GooglePlayGamesServices-26.1.405.0"
- enableOmahaRegistration: true
2026-01-24 07:19:46-6 | INFO 26 AcquireLock Acquiring installation lock
2026-01-24 07:19:46-6 | INFO 27 PlayInstaller Installation action list:
- actions: CheckPrerequisites, CleanupInstallDirectory-PreservePrevious, VerifyServiceRegistry, StopService, CheckGdsProcesses, ExtractApplication, RegisterService, RegisterWithGpg, CreateRegistryKey, RegisterWithOmaha, StartService
- finalization actions: VerifyServiceHealth, CleanupInstallDirectory-PreserveCurrent, DeleteService
2026-01-24 07:19:46-6 | INFO 28 LoggingAction Action CheckPrerequisites: executing
2026-01-24 07:19:46-6 | INFO 29 LoggingAction Action CheckPrerequisites: completed with result ActionResult.Success
2026-01-24 07:19:46-6 | INFO 30 LoggingAction Action CleanupInstallDirectory-PreservePrevious: executing
2026-01-24 07:19:46-6 | INFO 31 DirectoryUtil Deleting subdirectories of: Directory: 'C:\Program Files\Google\Play Games Services'
2026-01-24 07:19:46-6 | INFO 32 DirectoryUtil Excluding subdirectories: [Directory: 'C:\Program Files\Google\Play Games Services\25.12.281.0']
2026-01-24 07:19:46-6 | INFO 33 DirectoryUtil Finished pass to delete, removed 0 subdirectories
2026-01-24 07:19:46-6 | INFO 34 LoggingAction Action CleanupInstallDirectory-PreservePrevious: completed with result ActionResult.Success
2026-01-24 07:19:46-6 | INFO 35 LoggingAction Action VerifyServiceRegistry: executing
2026-01-24 07:19:46-6 | INFO 36 VerifyServiceRegistry Found service count: 733
2026-01-24 07:19:46-6 | INFO 37 VerifyServiceRegistry Existing GDS service names: [GooglePlayGamesServices-25.12.281.0]
2026-01-24 07:19:46-6 | INFO 38 LoggingAction Action VerifyServiceRegistry: completed with result ActionResult.Success
2026-01-24 07:19:46-6 | INFO 39 LoggingAction Action StopService: executing
2026-01-24 07:19:46-6 | INFO 40 Win32ServiceHelper Searching for service (serviceName: "GooglePlayGamesServices-25.12.281.0")
2026-01-24 07:19:46-6 | INFO 41 Win32ServiceHelper Found service (serviceName: "GooglePlayGamesServices-25.12.281.0", handle: 2355521083568)
2026-01-24 07:19:46-6 | INFO 42 Win32ServiceHelper Service "GooglePlayGamesServices-25.12.281.0" state: WindowsServiceState.SERVICE_RUNNING
2026-01-24 07:19:46-6 | INFO 43 Win32ServiceHelper Searching for service (serviceName: "GooglePlayGamesServices-25.12.281.0")
2026-01-24 07:19:46-6 | INFO 44 Win32ServiceHelper Found service (serviceName: "GooglePlayGamesServices-25.12.281.0", handle: 2355521083760)
2026-01-24 07:19:46-6 | INFO 45 Win32ServiceHelper Service "GooglePlayGamesServices-25.12.281.0" state: WindowsServiceState.SERVICE_RUNNING
2026-01-24 07:19:46-6 | INFO 46 Win32ServiceHelper Service "GooglePlayGamesServices-25.12.281.0" state: WindowsServiceState.SERVICE_RUNNING
2026-01-24 07:19:46-6 | INFO 47 Win32ServiceHelper Stopping service (name: "GooglePlayGamesServices-25.12.281.0", initialState: WindowsServiceState.SERVICE_RUNNING)
2026-01-24 07:19:46-6 | INFO 48 Win32ServiceHelper Service "GooglePlayGamesServices-25.12.281.0" state: WindowsServiceState.SERVICE_RUNNING
2026-01-24 07:19:46-6 | INFO 49 Win32ServiceHelper Stopping service (name: "GooglePlayGamesServices-25.12.281.0")
2026-01-24 07:19:46-6 | INFO 50 Win32ServiceHelper Service stop successfully requested (name: "GooglePlayGamesServices-25.12.281.0")
2026-01-24 07:19:46-6 | INFO 51 Win32ServiceHelper Service "GooglePlayGamesServices-25.12.281.0" state: WindowsServiceState.SERVICE_STOPPED
2026-01-24 07:19:46-6 | INFO 52 Win32ServiceHelper Waiting for process is running state to become: false
2026-01-24 07:19:46-6 | INFO 53 SystemHealthRecorder Network request check response: 204
2026-01-24 07:19:46-6 | INFO 54 Win32ServiceHelper Waiting for process is running state to become: false
2026-01-24 07:19:46-6 | INFO 55 Win32ServiceHelper Waiting for process is running state to become: false
2026-01-24 07:19:47-6 | INFO 56 Win32ServiceHelper Waiting for process is running state to become: false
2026-01-24 07:19:47-6 | INFO 57 Win32ServiceHelper Waiting for process is running state to become: false
2026-01-24 07:19:47-6 | INFO 58 Win32ServiceHelper Service stopped (name: "GooglePlayGamesServices-25.12.281.0")
2026-01-24 07:19:47-6 | INFO 59 Win32ServiceHelper Searching for service (serviceName: "GooglePlayGamesServices-25.12.281.0")
2026-01-24 07:19:47-6 | INFO 60 Win32ServiceHelper Found service (serviceName: "GooglePlayGamesServices-25.12.281.0", handle: 2355523321264)
2026-01-24 07:19:47-6 | INFO 61 Win32ServiceHelper Service "GooglePlayGamesServices-25.12.281.0" state: WindowsServiceState.SERVICE_STOPPED
2026-01-24 07:19:47-6 | INFO 62 LoggingAction Action StopService: completed with result ActionResult.Success
2026-01-24 07:19:47-6 | INFO 63 LoggingAction Action CheckGdsProcesses: executing
2026-01-24 07:19:47-6 | INFO 64 LoggingAction Action CheckGdsProcesses: completed with result ActionResult.Success
2026-01-24 07:19:47-6 | INFO 65 LoggingAction Action ExtractApplication: executing
2026-01-24 07:19:47-6 | INFO 66 ExtractApplication Installing files into Directory: 'C:\Program Files\Google\Play Games Services\26.1.405.0'
2026-01-24 07:19:47-6 | INFO 67 ExtractApplication Installer executing from C:\Windows\SystemTemp\updater_chrome_Unpacker_BeginUnzipping13372_725687747\installer_output979258524\GooglePlayGamesServicesInstaller.exe
2026-01-24 07:19:47-6 | INFO 68 PEExtractor Beginning extraction (output: C:\Program Files\Google\Play Games Services\26.1.405.0, extractOutput: C:\Program Files\Google\Play Games Services\26.1.405.0\temp-fa5c6cbc)
2026-01-24 07:19:47-6 | INFO 69 PEExtractor ExtractAppendedArchive: PE Size: 502272
2026-01-24 07:19:47-6 | INFO 70 PEExtractor GetAppendedFiles: starting offset: 502274
2026-01-24 07:19:47-6 | INFO 71 PEExtractor ExtractAppendedArchive: Creating file: C:\Program Files\Google\Play Games Services\26.1.405.0\temp-fa5c6cbc\7zr.exe
2026-01-24 07:19:47-6 | INFO 72 PEExtractor ExtractAppendedArchive: File dimensions: (805888, 502290)
2026-01-24 07:19:47-6 | INFO 73 PEExtractor ExtractAppendedArchive: Creating file: C:\Program Files\Google\Play Games Services\26.1.405.0\temp-fa5c6cbc\app_size.dat
2026-01-24 07:19:47-6 | INFO 74 PEExtractor ExtractAppendedArchive: File dimensions: (10, 39816240)
2026-01-24 07:19:47-6 | INFO 75 PEExtractor ExtractAppendedArchive: Creating file: C:\Program Files\Google\Play Games Services\26.1.405.0\temp-fa5c6cbc\archive.7z
2026-01-24 07:19:47-6 | INFO 76 PEExtractor ExtractAppendedArchive: File dimensions: (38508022, 1308197)
2026-01-24 07:19:47-6 | INFO 77 7zip 0M Scan C:\Program Files\Google\Play Games Services\26.1.405.0\temp-fa5c6cbc\
2026-01-24 07:19:47-6 | INFO 78 7zip 0%
2026-01-24 07:19:47-6 | INFO 79 7zip 23% 35
2026-01-24 07:19:48-6 | INFO 80 7zip 59% 35
2026-01-24 07:19:48-6 | INFO 81 7zip 85% 35
2026-01-24 07:19:48-6 | INFO 82 7zip 99% 39 - Service\flutter_windows.dll
2026-01-24 07:19:48-6 | INFO 83 DirectoryUtil Processing deletion for directory (path: C:\Program Files\Google\Play Games Services\26.1.405.0\temp-fa5c6cbc)
2026-01-24 07:19:48-6 | INFO 84 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\26.1.405.0\temp-fa5c6cbc\7zr.exe
2026-01-24 07:19:48-6 | INFO 85 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\26.1.405.0\temp-fa5c6cbc\app_size.dat
2026-01-24 07:19:48-6 | INFO 86 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\26.1.405.0\temp-fa5c6cbc\archive.7z
2026-01-24 07:19:48-6 | INFO 87 DirectoryUtil Finalizing deletion for directory (path: C:\Program Files\Google\Play Games Services\26.1.405.0\temp-fa5c6cbc)
2026-01-24 07:19:48-6 | INFO 88 DirectoryUtil Successfully deleted directory (path: C:\Program Files\Google\Play Games Services\26.1.405.0\temp-fa5c6cbc)
2026-01-24 07:19:48-6 | INFO 89 PEExtractor Extraction completed successfully
2026-01-24 07:19:48-6 | INFO 90 LoggingAction Action ExtractApplication: completed with result ActionResult.Success
2026-01-24 07:19:48-6 | INFO 91 LoggingAction Action RegisterService: executing
2026-01-24 07:19:48-6 | INFO 92 Win32ServiceHelper Searching for service (serviceName: "GooglePlayGamesServices-26.1.405.0")
2026-01-24 07:19:48-6 | INFO 93 Win32ServiceHelper Service lookup failure [0] [0] for: GooglePlayGamesServices-26.1.405.0
2026-01-24 07:19:48-6 | INFO 94 RegisterService Registering service GooglePlayGamesServices-26.1.405.0 (path: C:\Program Files\Google\Play Games Services\26.1.405.0\Service\GooglePlayGamesServices.exe)
2026-01-24 07:19:48-6 | INFO 95 Win32ServiceHelper Searching for service (serviceName: "GooglePlayGamesServices-26.1.405.0")
2026-01-24 07:19:48-6 | INFO 96 Win32ServiceHelper Found service (serviceName: "GooglePlayGamesServices-26.1.405.0", handle: 2355523323184)
2026-01-24 07:19:48-6 | INFO 97 Win32ServiceHelper Searching for service (serviceName: "GooglePlayGamesServices-26.1.405.0")
2026-01-24 07:19:48-6 | INFO 98 Win32ServiceHelper Found service (serviceName: "GooglePlayGamesServices-26.1.405.0", handle: 2355523320976)
2026-01-24 07:19:48-6 | INFO 99 Win32ServiceHelper Successfully configured restart recovery for: GooglePlayGamesServices-26.1.405.0
2026-01-24 07:19:48-6 | INFO 100 LoggingAction Action RegisterService: completed with result ActionResult.Success
2026-01-24 07:19:48-6 | INFO 101 LoggingAction Action RegisterWithGpg: executing
2026-01-24 07:19:48-6 | INFO 102 RegisterWithGpg Creating GPG registry values
2026-01-24 07:19:48-6 | INFO 103 LoggingAction Action RegisterWithGpg: completed with result ActionResult.Success
2026-01-24 07:19:48-6 | INFO 104 LoggingAction Action CreateRegistryKey: executing
2026-01-24 07:19:48-6 | INFO 105 CreateRegistryKey Creating GDS registry key
2026-01-24 07:19:48-6 | INFO 106 GdsRegistry Created GDS registry values
2026-01-24 07:19:48-6 | INFO 107 LoggingAction Action CreateRegistryKey: completed with result ActionResult.Success
2026-01-24 07:19:48-6 | INFO 108 LoggingAction Action RegisterWithOmaha: executing
2026-01-24 07:19:48-6 | INFO 109 RegisterWithOmaha Registering with Omaha
2026-01-24 07:19:48-6 | INFO 110 GdsOmahaRegistryManager Registered GDS Omaha product registry key
2026-01-24 07:19:48-6 | INFO 111 LoggingAction Action RegisterWithOmaha: completed with result ActionResult.Success
2026-01-24 07:19:48-6 | INFO 112 LoggingAction Action StartService: executing
2026-01-24 07:19:48-6 | INFO 113 StartService Starting service GooglePlayGamesServices-26.1.405.0
2026-01-24 07:19:48-6 | INFO 114 Win32ServiceHelper Searching for service (serviceName: "GooglePlayGamesServices-26.1.405.0")
2026-01-24 07:19:48-6 | INFO 115 Win32ServiceHelper Found service (serviceName: "GooglePlayGamesServices-26.1.405.0", handle: 2355523322848)
2026-01-24 07:19:48-6 | INFO 116 Win32ServiceHelper Service "GooglePlayGamesServices-26.1.405.0" state: WindowsServiceState.SERVICE_STOPPED
2026-01-24 07:19:48-6 | INFO 117 Win32ServiceHelper Starting service (name: "GooglePlayGamesServices-26.1.405.0", initialState: WindowsServiceState.SERVICE_STOPPED)
2026-01-24 07:19:49-6 | INFO 118 Win32ServiceHelper Service "GooglePlayGamesServices-26.1.405.0" state: WindowsServiceState.SERVICE_START_PENDING
2026-01-24 07:19:49-6 | INFO 119 Win32ServiceHelper Waiting for service to become one of states (targets: {WindowsServiceState.SERVICE_RUNNING}, current: WindowsServiceState.SERVICE_START_PENDING, waitHint: 0:00:00.100000)
2026-01-24 07:19:50-6 | INFO 120 Win32ServiceHelper Service "GooglePlayGamesServices-26.1.405.0" state: WindowsServiceState.SERVICE_RUNNING
2026-01-24 07:19:50-6 | INFO 121 Win32ServiceHelper Service started (name: "GooglePlayGamesServices-26.1.405.0")
2026-01-24 07:19:50-6 | INFO 122 Win32ServiceHelper Searching for service (serviceName: "GooglePlayGamesServices-26.1.405.0")
2026-01-24 07:19:50-6 | INFO 123 Win32ServiceHelper Found service (serviceName: "GooglePlayGamesServices-26.1.405.0", handle: 2355523322848)
2026-01-24 07:19:50-6 | INFO 124 Win32ServiceHelper Service "GooglePlayGamesServices-26.1.405.0" state: WindowsServiceState.SERVICE_RUNNING
2026-01-24 07:19:50-6 | INFO 125 StartService Successfully started GooglePlayGamesServices-26.1.405.0 after 1 attempts.
2026-01-24 07:19:50-6 | INFO 126 LoggingAction Action StartService: completed with result ActionResult.Success
2026-01-24 07:19:50-6 | INFO 127 PlayInstaller GooglePlayInstaller was successfully installed
2026-01-24 07:19:50-6 | INFO 128 LoggingAction Action VerifyServiceHealth: executing
2026-01-24 07:19:50-6 | INFO 129 VerifyServiceHealth Verifying the health of service
2026-01-24 07:19:50-6 | INFO 130 VerifyServiceHealth Sending health request
2026-01-24 07:19:50-6 | INFO 131 IpcClientFactory Creating new IPC channel
2026-01-24 07:19:50-6 | INFO 132 NamedPipeClientTransportConnector Client transport connecting to gds
2026-01-24 07:19:50-6 | INFO 133 IpcClientFactory IPC connection state changed: ConnectionState.connecting
2026-01-24 07:19:50-6 | INFO 134 NamedPipe Connecting to client named pipe: gds
2026-01-24 07:19:50-6 | WARNING 135 NamedPipe Failed to connect to gds with retriable error: 2. Retrying in 0:00:00.100000
2026-01-24 07:19:50-6 | WARNING 136 NamedPipe Failed to connect to gds with retriable error: 2. Retrying in 0:00:00.100000
2026-01-24 07:19:50-6 | WARNING 137 NamedPipe Failed to connect to gds with retriable error: 2. Retrying in 0:00:00.100000
2026-01-24 07:19:51-6 | INFO 138 NamedPipe Successfully bound to named pipe gds
2026-01-24 07:19:51-6 | INFO 139 NamedPipeClientTransportConnector Client transport connected successfully to gds.
2026-01-24 07:19:51-6 | INFO 140 IpcClientFactory IPC connection state changed: ConnectionState.ready
2026-01-24 07:19:51-6 | INFO 141 VerifyServiceHealth Received health response: appVersion: 26.1.405.0
2026-01-24 07:19:51-6 | INFO 142 VerifyServiceHealth GDS process ID: 21316
2026-01-24 07:19:51-6 | INFO 143 LoggingAction Action VerifyServiceHealth: completed with result ActionResult.Success
2026-01-24 07:19:51-6 | INFO 144 LoggingAction Action CleanupInstallDirectory-PreserveCurrent: executing
2026-01-24 07:19:51-6 | INFO 145 DirectoryUtil Deleting subdirectories of: Directory: 'C:\Program Files\Google\Play Games Services'
2026-01-24 07:19:51-6 | INFO 146 DirectoryUtil Excluding subdirectories: [Directory: 'C:\Program Files\Google\Play Games Services\26.1.405.0']
2026-01-24 07:19:51-6 | INFO 147 DirectoryUtil Processing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0)
2026-01-24 07:19:51-6 | INFO 148 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Licenses
2026-01-24 07:19:51-6 | INFO 149 DirectoryUtil Processing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Licenses)
2026-01-24 07:19:51-6 | INFO 150 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Licenses\LICENSES.txt
2026-01-24 07:19:51-6 | WARNING 151 DirectoryUtil Error while deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Licenses\LICENSES.txt
error: Fn (PathAccessException: Cannot delete file, path = 'C:\Program Files\Google\Play Games Services\25.12.281.0\Licenses\LICENSES.txt' (OS Error: Acceso denegado, errno = 5))
2026-01-24 07:19:51-6 | INFO 152 DirectoryUtil Finalizing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Licenses)
2026-01-24 07:19:51-6 | INFO 153 DirectoryUtil Successfully deleted directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Licenses)
2026-01-24 07:19:51-6 | INFO 154 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service
2026-01-24 07:19:51-6 | INFO 155 DirectoryUtil Processing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service)
2026-01-24 07:19:51-6 | INFO 156 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data
2026-01-24 07:19:51-6 | INFO 157 DirectoryUtil Processing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data)
2026-01-24 07:19:51-6 | INFO 158 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\icudtl.dat
2026-01-24 07:19:51-6 | INFO 159 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\liboverlay.so
2026-01-24 07:19:51-6 | INFO 160 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\libwindows.so
2026-01-24 07:19:51-6 | INFO 161 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\overlay.assets
2026-01-24 07:19:51-6 | INFO 162 DirectoryUtil Processing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\overlay.assets)
2026-01-24 07:19:51-6 | INFO 163 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\overlay.assets\All1PIcons-Regular.otf
2026-01-24 07:19:51-6 | INFO 164 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\overlay.assets\AssetManifest.bin
2026-01-24 07:19:51-6 | INFO 165 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\overlay.assets\FontManifest.json
2026-01-24 07:19:51-6 | INFO 166 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\overlay.assets\MaterialIcons-Extended.ttf
2026-01-24 07:19:51-6 | INFO 167 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\overlay.assets\NOTICES.Z
2026-01-24 07:19:51-6 | INFO 168 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\overlay.assets\shaders
2026-01-24 07:19:51-6 | INFO 169 DirectoryUtil Processing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\overlay.assets\shaders)
2026-01-24 07:19:51-6 | INFO 170 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\overlay.assets\shaders\ink_sparkle.frag
2026-01-24 07:19:51-6 | INFO 171 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\overlay.assets\shaders\stretch_effect.frag
2026-01-24 07:19:51-6 | INFO 172 DirectoryUtil Finalizing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\overlay.assets\shaders)
2026-01-24 07:19:51-6 | INFO 173 DirectoryUtil Successfully deleted directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\overlay.assets\shaders)
2026-01-24 07:19:51-6 | INFO 174 DirectoryUtil Finalizing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\overlay.assets)
2026-01-24 07:19:51-6 | INFO 175 DirectoryUtil Successfully deleted directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\overlay.assets)
2026-01-24 07:19:51-6 | INFO 176 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\windows.assets
2026-01-24 07:19:51-6 | INFO 177 DirectoryUtil Processing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\windows.assets)
2026-01-24 07:19:51-6 | INFO 178 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\windows.assets\All1PIcons-Regular.otf
2026-01-24 07:19:51-6 | INFO 179 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\windows.assets\AssetManifest.bin
2026-01-24 07:19:51-6 | INFO 180 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\windows.assets\crashpad_handler.exe
2026-01-24 07:19:51-6 | INFO 181 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\windows.assets\FontManifest.json
2026-01-24 07:19:51-6 | INFO 182 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\windows.assets\MaterialIcons-Extended.ttf
2026-01-24 07:19:51-6 | INFO 183 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\windows.assets\NOTICES.Z
2026-01-24 07:19:51-6 | INFO 184 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\windows.assets\shaders
2026-01-24 07:19:51-6 | INFO 185 DirectoryUtil Processing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\windows.assets\shaders)
2026-01-24 07:19:51-6 | INFO 186 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\windows.assets\shaders\ink_sparkle.frag
2026-01-24 07:19:51-6 | INFO 187 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\windows.assets\shaders\stretch_effect.frag
2026-01-24 07:19:51-6 | INFO 188 DirectoryUtil Finalizing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\windows.assets\shaders)
2026-01-24 07:19:51-6 | INFO 189 DirectoryUtil Successfully deleted directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\windows.assets\shaders)
2026-01-24 07:19:51-6 | INFO 190 DirectoryUtil Finalizing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\windows.assets)
2026-01-24 07:19:51-6 | INFO 191 DirectoryUtil Successfully deleted directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data\windows.assets)
2026-01-24 07:19:51-6 | INFO 192 DirectoryUtil Finalizing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data)
2026-01-24 07:19:51-6 | INFO 193 DirectoryUtil Successfully deleted directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\data)
2026-01-24 07:19:51-6 | INFO 194 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\flutter_windows.dll
2026-01-24 07:19:51-6 | INFO 195 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\GooglePlayGamesServices.exe
2026-01-24 07:19:51-6 | INFO 196 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\GooglePlayGamesServicesOverlay.exe
2026-01-24 07:19:51-6 | INFO 197 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\libnative_asset.so
2026-01-24 07:19:51-6 | INFO 198 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\libpurchase_webview_ffi_dart_native_asset.so
2026-01-24 07:19:51-6 | INFO 199 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service\WebView2Loader.dll
2026-01-24 07:19:51-6 | INFO 200 DirectoryUtil Finalizing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service)
2026-01-24 07:19:51-6 | INFO 201 DirectoryUtil Successfully deleted directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Service)
2026-01-24 07:19:51-6 | INFO 202 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller
2026-01-24 07:19:51-6 | INFO 203 DirectoryUtil Processing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller)
2026-01-24 07:19:51-6 | INFO 204 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data
2026-01-24 07:19:51-6 | INFO 205 DirectoryUtil Processing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data)
2026-01-24 07:19:51-6 | INFO 206 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data\icudtl.dat
2026-01-24 07:19:51-6 | INFO 207 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data\installer_uninstaller_windows.assets
2026-01-24 07:19:51-6 | INFO 208 DirectoryUtil Processing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data\installer_uninstaller_windows.assets)
2026-01-24 07:19:51-6 | INFO 209 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data\installer_uninstaller_windows.assets\All1PIcons-Regular.otf
2026-01-24 07:19:51-6 | INFO 210 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data\installer_uninstaller_windows.assets\AssetManifest.bin
2026-01-24 07:19:51-6 | INFO 211 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data\installer_uninstaller_windows.assets\crashpad_handler.exe
2026-01-24 07:19:51-6 | INFO 212 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data\installer_uninstaller_windows.assets\FontManifest.json
2026-01-24 07:19:51-6 | INFO 213 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data\installer_uninstaller_windows.assets\MaterialIcons-Extended.ttf
2026-01-24 07:19:51-6 | INFO 214 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data\installer_uninstaller_windows.assets\NOTICES.Z
2026-01-24 07:19:51-6 | INFO 215 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data\installer_uninstaller_windows.assets\shaders
2026-01-24 07:19:51-6 | INFO 216 DirectoryUtil Processing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data\installer_uninstaller_windows.assets\shaders)
2026-01-24 07:19:51-6 | INFO 217 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data\installer_uninstaller_windows.assets\shaders\ink_sparkle.frag
2026-01-24 07:19:51-6 | INFO 218 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data\installer_uninstaller_windows.assets\shaders\stretch_effect.frag
2026-01-24 07:19:51-6 | INFO 219 DirectoryUtil Finalizing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data\installer_uninstaller_windows.assets\shaders)
2026-01-24 07:19:51-6 | INFO 220 DirectoryUtil Successfully deleted directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data\installer_uninstaller_windows.assets\shaders)
2026-01-24 07:19:51-6 | INFO 221 DirectoryUtil Finalizing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data\installer_uninstaller_windows.assets)
2026-01-24 07:19:51-6 | INFO 222 DirectoryUtil Successfully deleted directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data\installer_uninstaller_windows.assets)
2026-01-24 07:19:51-6 | INFO 223 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data\libinstaller_uninstaller_windows.so
2026-01-24 07:19:52-6 | INFO 224 DirectoryUtil Finalizing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data)
2026-01-24 07:19:52-6 | INFO 225 DirectoryUtil Successfully deleted directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\data)
2026-01-24 07:19:52-6 | INFO 226 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\flutter_windows.dll
2026-01-24 07:19:52-6 | INFO 227 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\GooglePlayGamesServicesUninstaller.exe
2026-01-24 07:19:52-6 | INFO 228 DirectoryUtil Deleting path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller\libnative_asset.so
2026-01-24 07:19:52-6 | INFO 229 DirectoryUtil Finalizing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller)
2026-01-24 07:19:52-6 | INFO 230 DirectoryUtil Successfully deleted directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0\Uninstaller)
2026-01-24 07:19:52-6 | INFO 231 DirectoryUtil Finalizing deletion for directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0)
2026-01-24 07:19:52-6 | INFO 232 DirectoryUtil Successfully deleted directory (path: C:\Program Files\Google\Play Games Services\25.12.281.0)
2026-01-24 07:19:52-6 | INFO 233 DirectoryUtil Finished pass to delete, removed 1 subdirectories
2026-01-24 07:19:52-6 | INFO 234 LoggingAction Action CleanupInstallDirectory-PreserveCurrent: completed with result ActionResult.Success
2026-01-24 07:19:52-6 | INFO 235 LoggingAction Action DeleteService: executing
2026-01-24 07:19:52-6 | INFO 236 Win32ServiceHelper Searching for service (serviceName: "GooglePlayGamesServices-25.12.281.0")
2026-01-24 07:19:52-6 | INFO 237 Win32ServiceHelper Found service (serviceName: "GooglePlayGamesServices-25.12.281.0", handle: 2355523326304)
2026-01-24 07:19:52-6 | INFO 238 Win32ServiceHelper Deleting service (name: "GooglePlayGamesServices-25.12.281.0")
2026-01-24 07:19:52-6 | INFO 239 Win32ServiceHelper Deletion request for service successful (name: "GooglePlayGamesServices-25.12.281.0"); note service may not yet be deleted
2026-01-24 07:19:52-6 | INFO 240 LoggingAction Action DeleteService: completed with result ActionResult.Success
2026-01-24 07:19:52-6 | INFO 241 SetInstallerResult Setting Omaha installer error code to 0
2026-01-24 07:19:52-6 | INFO 242 Application Program completed
2026-01-24 07:19:52-6 | INFO 243 Application Services shutting down
2026-01-24 07:19:52-6 | INFO 244 ServiceGroupController Service group stopping: ApplicationServices
2026-01-24 07:19:52-6 | INFO 245 ServiceController Service stopping: Installer
2026-01-24 07:19:52-6 | INFO 246 ServiceController Service stopped: Installer
2026-01-24 07:19:52-6 | INFO 247 ServiceController Service stopping: SystemHealth
2026-01-24 07:19:52-6 | INFO 248 ServiceController Service stopped: SystemHealth
2026-01-24 07:19:52-6 | INFO 249 ServiceController Service stopping: MetricsRecorder
2026-01-24 07:19:52-6 | INFO 250 ServiceController Service stopped: MetricsRecorder
2026-01-24 07:19:52-6 | INFO 251 ServiceController Service stopping: CrashReporter
2026-01-24 07:19:52-6 | INFO 252 ServiceController Service stopped: CrashReporter
2026-01-24 07:19:52-6 | INFO 253 ServiceController Service stopping: Logging
2026-01-24 07:19:52-6 | INFO 254 LoggingService Runtime Information:
 - Build Info: BuildInfo(buildType: release, appVersion: 26.1.405.0)
 - Pid: 13884
 - Executable: C:\Windows\SystemTemp\updater_chrome_Unpacker_BeginUnzipping13372_725687747\installer_output979258524\GooglePlayGamesServicesInstaller.exe
 - Arguments: []
 - OS Version: "Windows 10 Home" 10.0 (Build 26200)
 - Dart Version: 3.12.0-32.0.dev (dev) (Thu Jan 15 08:03:31 2026 -0800) on "windows_x64"
 - Dart Build Id: 86c7304b96add146982d9e65d111ce40
 - Dart Crash Debug Id: 4B30C786AD9646D1982D9E65D111CE400
2026-01-24 07:19:52-6 | INFO 255 ServiceController Service stopped: Logging
2026-01-24 07:19:52-6 | INFO 256 ServiceGroupController Service group stopped: ApplicationServices
2026-01-24 07:19:52-6 | INFO 257 Application Services shut down
2026-01-24 07:19:52-6 | INFO 258 Application App completed successfully: ApplicationRunResult {
  exitReason=ApplicationExitReason.programCompleted,
  programCompletion=ProgramCompletion: 0,
}
2026-01-24 07:19:52-6 | INFO 259 Application Run result: ApplicationRunResult {
  exitReason=ApplicationExitReason.programCompleted,
  programCompletion=ProgramCompletion: 0,
}
2026-01-24 07:19:52-6 | INFO 260  Log stopped.

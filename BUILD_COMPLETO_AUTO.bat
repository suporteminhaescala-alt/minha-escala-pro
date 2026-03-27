cd C:\Users\jefer\Desktop\MINHA_ESCALA_VERSAO_TABLET

$roboBlindado = @'
@echo off
color 0A
echo =====================================================
echo    MINHA ESCALA - BUILD AUTOMATICO COMPLETO
echo    (Versao Limpa - Direto da Raiz)
echo =====================================================
echo.

set PROJETO=C:\Users\jefer\Desktop\MINHA_ESCALA_VERSAO_TABLET
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%

:: [1/4] BACKUP DE SEGURANCA
echo [1/4] Criando backup de seguranca da Raiz...
if not exist "%PROJETO%\BACKUPS_DE_OURO" mkdir "%PROJETO%\BACKUPS_DE_OURO"
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value 2^>nul') do set DT=%%I
set TS=%DT:~0,4%-%DT:~4,2%-%DT:~6,2%_%DT:~8,2%-%DT:~10,2%
set BACKUP=%PROJETO%\BACKUPS_DE_OURO\index_backup_%TS%.html

copy /Y "%PROJETO%\index.html" "%BACKUP%" >nul
if exist "%BACKUP%" (
    echo [OK] Backup criado com sucesso!
) else (
    echo [ERRO] Falha ao criar backup!
    pause
    exit /b 1
)
echo.

:: [2/4] ATUALIZANDO PASTA DIST
echo [2/4] Injetando index da Raiz para a pasta dist...
if not exist "%PROJETO%\dist" mkdir "%PROJETO%\dist"
copy /Y "%PROJETO%\index.html" "%PROJETO%\dist\index.html" >nul
echo [OK] A pasta dist recebeu o arquivo atualizado!
echo.

:: [3/4] SINCRONIZACAO CAPACITOR
echo [3/4] Sincronizando Capacitor...
cd /d "%PROJETO%"
call npx cap sync android
echo.

:: [4/4] COMPILACAO ANDROID
echo [4/4] Compilando APK...
cd /d "%PROJETO%\android"
call .\gradlew clean
call .\gradlew assembleDebug
echo.

:: ENTREGA DO APK
set APK_DIR=%PROJETO%\android\app\build\outputs\apk\debug
set APK_DEBUG=%APK_DIR%\app-debug.apk
set APK_FINAL=%APK_DIR%\app-release.apk

if exist "%APK_DEBUG%" (
    copy /Y "%APK_DEBUG%" "%APK_FINAL%" >nul
    echo =====================================================
    echo    APK GERADO COM SUCESSO!
    echo =====================================================
    explorer "%APK_DIR%"
) else (
    echo [ERRO] APK nao foi gerado.
)
echo.
pause
'@

Set-Content -Path "BUILD_COMPLETO_AUTO.bat" -Value $roboBlindado -Encoding ASCII
Write-Host "✅ ROBO ATUALIZADO COM SUCESSO! Pode ir na pasta e dar o duplo clique nele." -ForegroundColor Green
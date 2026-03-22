@echo off
color 0A
echo =====================================================
echo    MINHA ESCALA - BUILD AUTOMATICO COMPLETO
echo    Desenvolvido com Claude AI
echo =====================================================
echo.

set PROJETO=C:\Users\jefer\Desktop\MINHA_ESCALA_VERSAO_TABLET
set DOWNLOADS=C:\Users\jefer\Downloads
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%

:: ─────────────────────────────────────────
:: [1/5] BACKUP DE OURO
:: ─────────────────────────────────────────
echo [1/5] Criando backup de seguranca...

if not exist "%PROJETO%\BACKUPS_DE_OURO" mkdir "%PROJETO%\BACKUPS_DE_OURO"

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value 2^>nul') do set DT=%%I
set TS=%DT:~0,4%-%DT:~4,2%-%DT:~6,2%_%DT:~8,2%-%DT:~10,2%
set BACKUP=%PROJETO%\BACKUPS_DE_OURO\index_backup_%TS%.html

copy /Y "%PROJETO%\index.html" "%BACKUP%" >nul
if exist "%BACKUP%" (
    echo [OK] Backup criado: index_backup_%TS%.html
) else (
    echo [ERRO] Falha ao criar backup! Abortando.
    pause
    exit /b 1
)
echo.

:: ─────────────────────────────────────────
:: [2/5] COPIA ARQUIVOS DO DOWNLOADS
:: ─────────────────────────────────────────
echo [2/5] Copiando arquivos novos do Downloads...

if exist "%DOWNLOADS%\index.html" (
    copy /Y "%DOWNLOADS%\index.html" "%PROJETO%\index.html" >nul
    copy /Y "%DOWNLOADS%\index.html" "%PROJETO%\dist\index.html" >nul
    echo [OK] index.html copiado para raiz e dist
) else (
    echo [AVISO] index.html nao encontrado no Downloads - usando o atual
)

if exist "%DOWNLOADS%\AndroidManifest.xml" (
    copy /Y "%DOWNLOADS%\AndroidManifest.xml" "%PROJETO%\android\app\src\main\AndroidManifest.xml" >nul
    echo [OK] AndroidManifest.xml copiado
) else (
    echo [AVISO] AndroidManifest.xml nao encontrado no Downloads - usando o atual
)
echo.

:: ─────────────────────────────────────────
:: [3/5] SINCRONIZACAO CAPACITOR
:: ─────────────────────────────────────────
echo [3/5] Sincronizando Capacitor...
cd /d "%PROJETO%"
call npx cap sync android
echo.

:: ─────────────────────────────────────────
:: [4/5] COMPILACAO ANDROID
:: ─────────────────────────────────────────
echo [4/5] Compilando APK...
cd /d "%PROJETO%\android"
call .\gradlew clean
call .\gradlew assembleDebug
echo.

:: ─────────────────────────────────────────
:: [5/5] ENTREGA DO APK
:: ─────────────────────────────────────────
set APK_DIR=%PROJETO%\android\app\build\outputs\apk\debug
set APK_DEBUG=%APK_DIR%\app-debug.apk
set APK_FINAL=%APK_DIR%\app-release.apk

if exist "%APK_DEBUG%" (
    copy /Y "%APK_DEBUG%" "%APK_FINAL%" >nul
    echo.
    echo =====================================================
    echo    APK GERADO COM SUCESSO!
    echo    Arquivo: app-release.apk
    echo =====================================================
    explorer "%APK_DIR%"
) else (
    echo [ERRO] APK nao foi gerado. Verifique os erros acima.
)

echo.
pause
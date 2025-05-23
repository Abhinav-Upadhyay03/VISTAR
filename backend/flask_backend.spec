# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['/Users/abhinavupadhyay/personal/Vistar/backend/run.py'],
    pathex=[],
    binaries=[],
    datas=[('requirements.txt', '.'), ('app', 'app'), ('app/static/assets/color_map_crop.jpg', 'app/static/assets')],
    hiddenimports=['flask', 'flask_cors', 'numpy', 'pandas', 'scipy', 'opencv-python', 'networkx', 'scikit-image'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='flask_backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
app = BUNDLE(
    exe,
    name='flask_backend.app',
    icon=None,
    bundle_identifier=None,
)

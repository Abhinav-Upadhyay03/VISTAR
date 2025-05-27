# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['C:\\Users\\arnav\\VISTAR\\backend\\run.py'],
    pathex=[],
    binaries=[],
    datas=[('C:\\Users\\arnav\\VISTAR\\backend\\requirements.txt', '.'), ('C:\\Users\\arnav\\VISTAR\\backend\\app', 'app'), ('C:\\Users\\arnav\\VISTAR\\backend\\app/static/assets/color_map_crop.jpg', 'app/static/assets')],
    hiddenimports=['flask', 'flask_cors', 'numpy', 'pandas', 'scipy', 'cv2', 'networkx', 'skimage', 'skimage.io', 'skimage.io._plugins', 'skimage.io._plugins.pil_plugin', 'skimage.feature', 'skimage.filters', 'skimage.morphology', 'skimage.transform', 'skimage.util', 'PIL'],
    hookspath=['.'],
    hooksconfig={},
    runtime_hooks=['windows_hook.py'],
    excludes=['matplotlib', 'tkinter'],
    noarchive=False,
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

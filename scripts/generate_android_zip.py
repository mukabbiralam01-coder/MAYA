import os
import zipfile

def create_android_zip():
    zip_filename = 'zoya-android-project.zip'
    source_dir = 'android'
    
    if not os.path.exists(source_dir):
        print(f"Directory {source_dir} not found")
        return

    exclude_dirs = {'.git', '.gradle', 'build', '.idea'}

    targets = [zip_filename, os.path.join('public', zip_filename), 'zoya-android-app.zip', os.path.join('public', 'zoya-android-app.zip')]

    for target in targets:
        os.makedirs(os.path.dirname(target) if os.path.dirname(target) else '.', exist_ok=True)
        with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(source_dir):
                dirs[:] = [d for d in dirs if d not in exclude_dirs]
                for f in files:
                    if f.endswith('.pyc') or f.startswith('.'):
                        continue
                    file_path = os.path.join(root, f)
                    arcname = os.path.relpath(file_path, '.')
                    zipf.write(file_path, arcname)
        print(f"Successfully created {target} (size: {os.path.getsize(target)} bytes)")

if __name__ == '__main__':
    create_android_zip()

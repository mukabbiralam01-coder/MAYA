import os
import zipfile

def create_project_zip(output_path='zoya-ai-assistant.zip'):
    exclude_dirs = {'.git', 'node_modules', '.next', 'dist', '__pycache__', '.aistudio'}
    exclude_files = {'zoya-ai-assistant.zip', 'bun.lock'}

    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # filter out excluded dirs
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
            for f in files:
                if f in exclude_files or f.endswith('.pyc') or (f.startswith('.') and f not in {'.env.example', '.gitignore'}):
                    continue
                file_path = os.path.join(root, f)
                arcname = os.path.relpath(file_path, '.')
                zipf.write(file_path, arcname)

    print(f"Archive successfully written to {output_path}")

if __name__ == '__main__':
    create_project_zip('zoya-ai-assistant.zip')
    if os.path.exists('public'):
        create_project_zip('public/zoya-ai-assistant.zip')

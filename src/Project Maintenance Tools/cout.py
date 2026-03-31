# PMT - Author Dmitry Khorov


import os

def count_files_and_folders(root_dir):
    total_files = 0
    total_folders = 0

    for _, dirs, files in os.walk(root_dir):
        total_folders += len(dirs)
        total_files += len(files)

    return total_files, total_folders


def main():
    root = os.getcwd()  
    files, folders = count_files_and_folders(root)

    print("📁 Анализ проекта:", root)
    print("-----------------------------")
    print(f"Всего файлов:  {files}")
    print(f"Всего папок:   {folders}")
    print("-----------------------------")
    print(f"Итого элементов: {files + folders}")


if __name__ == "__main__":
    main()

# AtomGlide Front-end Client
# Author: Dmitry Khorov
# GitHub: DKhorov
# Telegram: @dkdevelop @jpegweb
# 2026 Project


AUTHOR_INFO = """Author: Dmitry Khorov
Telegram: @dkdevelop @jpegweb
DK Studio Production 
2026 год 1 января 00:00
"""


AUTHOR_INFO = """Author: Dmitry Khorov
Telegram: @dkdevelop @jpegweb
DK Studio Production 
2026 год 1 января 00:00
"""


AUTHOR_INFO = """Author: Dmitry Khorov
Telegram: @dkdevelop @jpegweb
DK Studio Production 
2026 год 1 января 00:00
"""


AUTHOR_INFO = """Author: Dmitry Khorov
Telegram: @dkdevelop @jpegweb
DK Studio Production 
2026 год 1 января 00:00
"""

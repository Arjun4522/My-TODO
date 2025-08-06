#include <windows.h>
#include <commctrl.h>
#include <fstream>
#include <string>
#include <vector>

#pragma comment(lib, "comctl32.lib")

#define ID_CALENDAR 101
#define ID_LISTBOX 102
#define ID_ADDBUTTON 103
#define ID_DELETEBUTTON 104
#define ID_INPUT 105

HWND hCalendar, hListBox, hInput;
std::string selectedDate = "";

std::string FormatDate(SYSTEMTIME st) {
    char buf[11];
    sprintf(buf, "%04d-%02d-%02d", st.wYear, st.wMonth, st.wDay);
    return std::string(buf);
}

void LoadTasks() {
    SendMessage(hListBox, LB_RESETCONTENT, 0, 0);
    std::ifstream file("todo.txt");
    std::string line;
    while (std::getline(file, line)) {
        if (line.rfind(selectedDate + "|", 0) == 0) {
            std::string task = line.substr(selectedDate.length() + 1);
            SendMessage(hListBox, LB_ADDSTRING, 0, (LPARAM)task.c_str());
        }
    }
    file.close();
}

void AddTask(std::string task) {
    std::ofstream file("todo.txt", std::ios::app);
    file << selectedDate << "|" << task << "\n";
    file.close();
    LoadTasks();
}

void DeleteTask(int index) {
    char buffer[256];
    SendMessage(hListBox, LB_GETTEXT, index, (LPARAM)buffer);
    std::ifstream file("todo.txt");
    std::ofstream temp("temp.txt");
    std::string line;
    while (std::getline(file, line)) {
        if (line != selectedDate + "|" + buffer) {
            temp << line << "\n";
        }
    }
    file.close();
    temp.close();
    remove("todo.txt");
    rename("temp.txt", "todo.txt");
    LoadTasks();
}

LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    switch (msg) {
        case WM_CREATE: {
            INITCOMMONCONTROLSEX icex = { sizeof(icex), ICC_DATE_CLASSES };
            InitCommonControlsEx(&icex);

            hCalendar = CreateWindowEx(0, MONTHCAL_CLASS, NULL,
                WS_CHILD | WS_VISIBLE | MCS_NOTODAYCIRCLE,
                10, 10, 250, 160, hwnd, (HMENU)ID_CALENDAR, NULL, NULL);

            hInput = CreateWindow("EDIT", "", WS_CHILD | WS_VISIBLE | WS_BORDER,
                270, 10, 200, 25, hwnd, (HMENU)ID_INPUT, NULL, NULL);

            CreateWindow("BUTTON", "Add Task", WS_CHILD | WS_VISIBLE,
                480, 10, 80, 25, hwnd, (HMENU)ID_ADDBUTTON, NULL, NULL);

            hListBox = CreateWindow("LISTBOX", NULL, WS_CHILD | WS_VISIBLE | WS_BORDER | LBS_NOTIFY,
                270, 45, 290, 120, hwnd, (HMENU)ID_LISTBOX, NULL, NULL);

            CreateWindow("BUTTON", "Delete Task", WS_CHILD | WS_VISIBLE,
                270, 170, 100, 25, hwnd, (HMENU)ID_DELETEBUTTON, NULL, NULL);

            SYSTEMTIME st;
            GetLocalTime(&st);
            selectedDate = FormatDate(st);
            LoadTasks();
            break;
        }
        case WM_COMMAND: {
            switch (LOWORD(wParam)) {
                case ID_ADDBUTTON: {
                    char task[256];
                    GetWindowText(hInput, task, 256);
                    if (strlen(task) > 0) {
                        AddTask(task);
                        SetWindowText(hInput, "");
                    }
                    break;
                }
                case ID_DELETEBUTTON: {
                    int index = (int)SendMessage(hListBox, LB_GETCURSEL, 0, 0);
                    if (index != LB_ERR) {
                        DeleteTask(index);
                    }
                    break;
                }
            }
            break;
        }
        case WM_NOTIFY: {
            if (((LPNMHDR)lParam)->idFrom == ID_CALENDAR && ((LPNMHDR)lParam)->code == MCN_SELCHANGE) {
                SYSTEMTIME st;
                MonthCal_GetCurSel(hCalendar, &st);
                selectedDate = FormatDate(st);
                LoadTasks();
            }
            break;
        }
        case WM_DESTROY:
            PostQuitMessage(0);
            break;
        default:
            return DefWindowProc(hwnd, msg, wParam, lParam);
    }
    return 0;
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    WNDCLASS wc = { 0 };
    wc.lpfnWndProc = WndProc;
    wc.hInstance = hInstance;
    wc.lpszClassName = "CalendarToDoApp";
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);

    RegisterClass(&wc);

    HWND hwnd = CreateWindow("CalendarToDoApp", "Calendar & To-Do List",
        WS_OVERLAPPEDWINDOW ^ WS_MAXIMIZEBOX ^ WS_THICKFRAME,
        CW_USEDEFAULT, CW_USEDEFAULT, 580, 250,
        NULL, NULL, hInstance, NULL);

    ShowWindow(hwnd, nCmdShow);
    UpdateWindow(hwnd);

    MSG msg;
    while (GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }
    return (int)msg.wParam;
}

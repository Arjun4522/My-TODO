#include <QApplication>
#include <QMainWindow>
#include <QCalendarWidget>
#include <QListWidget>
#include <QPushButton>
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QLineEdit>
#include <QFile>
#include <QTextStream>
#include <QDate>

class CalendarToDo : public QMainWindow {
    Q_OBJECT

public:
    CalendarToDo(QWidget *parent = nullptr) : QMainWindow(parent) {
        QWidget *central = new QWidget(this);
        setCentralWidget(central);

        calendar = new QCalendarWidget;
        list = new QListWidget;
        input = new QLineEdit;
        QPushButton *addBtn = new QPushButton("Add Task");
        QPushButton *delBtn = new QPushButton("Delete Task");

        QVBoxLayout *mainLayout = new QVBoxLayout;
        QHBoxLayout *inputLayout = new QHBoxLayout;

        inputLayout->addWidget(input);
        inputLayout->addWidget(addBtn);

        mainLayout->addWidget(calendar);
        mainLayout->addLayout(inputLayout);
        mainLayout->addWidget(list);
        mainLayout->addWidget(delBtn);

        central->setLayout(mainLayout);

        connect(calendar, &QCalendarWidget::selectionChanged, this, &CalendarToDo::loadTasks);
        connect(addBtn, &QPushButton::clicked, this, &CalendarToDo::addTask);
        connect(delBtn, &QPushButton::clicked, this, &CalendarToDo::deleteTask);

        loadTasks();
    }

private slots:
    void loadTasks() {
        list->clear();
        QFile file("todo.txt");
        if (!file.open(QIODevice::ReadOnly | QIODevice::Text)) return;

        QTextStream in(&file);
        QString dateStr = calendar->selectedDate().toString("yyyy-MM-dd");
        while (!in.atEnd()) {
            QString line = in.readLine();
            if (line.startsWith(dateStr + "|")) {
                QString task = line.section('|', 1);
                list->addItem(task);
            }
        }
        file.close();
    }

    void addTask() {
        QString task = input->text().trimmed();
        if (task.isEmpty()) return;

        QString dateStr = calendar->selectedDate().toString("yyyy-MM-dd");
        QFile file("todo.txt");
        if (file.open(QIODevice::Append | QIODevice::Text)) {
            QTextStream out(&file);
            out << dateStr << "|" << task << "\n";
            file.close();
        }
        input->clear();
        loadTasks();
    }

    void deleteTask() {
        QListWidgetItem *item = list->currentItem();
        if (!item) return;

        QString dateStr = calendar->selectedDate().toString("yyyy-MM-dd");
        QString taskToDelete = item->text();

        QFile file("todo.txt");
        QFile temp("temp.txt");
        if (!file.open(QIODevice::ReadOnly | QIODevice::Text)) return;
        if (!temp.open(QIODevice::WriteOnly | QIODevice::Text)) return;

        QTextStream in(&file), out(&temp);
        while (!in.atEnd()) {
            QString line = in.readLine();
            if (line != dateStr + "|" + taskToDelete) {
                out << line << "\n";
            }
        }
        file.close();
        temp.close();
        file.remove();
        temp.rename("todo.txt");
        loadTasks();
    }

private:
    QCalendarWidget *calendar;
    QListWidget *list;
    QLineEdit *input;
};

#include "main.moc"

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);
    CalendarToDo window;
    window.setWindowTitle("Calendar & To-Do List");
    window.resize(400, 500);
    window.show();
    return app.exec();
}

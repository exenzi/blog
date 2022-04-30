---
setup: |
  import Layout from '../../layouts/BlogPost.astro'
title:  "🐍 Pipenv - npm по-змеиному"
date:   20 Dec 2020
author: Макс Рокицкий
tags: python pipenv pip
description: В экосистеме Python есть 2 проблемы. Глобальные пакеты и генерация requirements.txt вручную. Как минимум первую проблему решают venv и Pipenv, но Pipenv также предоставляет больше функционала. Хотя если он вам не нужен, то предпочтительней использовать venv.
---

В экосистеме Python есть 2 проблемы:

1. Все пакеты устанавливаются глобально и доступны в любом проекте, что ведёт к конфликтам версий. Если один код писался под одну версию, а второй под другую, и между версиями есть значительные отличия, то какой-то код может вызывать ошибку. 
2. Список пакетов приходится генерировать вручную, т.к. через `pip freeze` в список также попадут пакеты, которые нам нужны только во время разработки (например pylint и autopep8).

Как минимум первую проблему решают venv и Pipenv, но Pipenv также предоставляет больше функционала. Хотя если он вам не нужен, то предпочтительней использовать venv.

## Зачем нужно виртуальное окружение

Виртуальное окружение позволяет изолироваться от всех глобально установленных пакетов и использовать только нужные пакеты нужных версий. По-сути это просто отдельная папка для каждого проекта, в которую устанавливаются пакеты, нужные только в этом проекте.

![image-20201220231739564](/assets/blog/images/image-20201220231739564.png) 

Также изолируется интерпретатор Python, что позволяет использовать в проекте версию Python отличную от установленной на компьютере по-умолчанию.

## Как использовать Pipenv

Установка:

```
# Linux
pip3 install pipenv

# Windows
pip install pipenv
```

Создаём и заходим в папку с проектом:

```
mkdir myproject
cd myproject
```

Создаём виртуальное окружение:

```
pipenv install
```

```
Creating a virtualenv for this project...
Pipfile: /home/user/myproject/Pipfile
Using /usr/bin/python3.9 (3.9.1) to create virtualenv...
⠋ Creating virtual environment...created virtual environment CPython3.9.1.final.0-64 in 639ms
< --- >
  activators BashActivator,CShellActivator,FishActivator,PowerShellActivator,PythonActivator,XonshActivator

✔ Successfully created virtual environment!
Virtualenv location: /home/user/.local/share/virtualenvs/myproject-Ny9jr0AU
Creating a Pipfile for this project...
Pipfile.lock not found, creating...
Locking [dev-packages] dependencies...
Locking [packages] dependencies...
Updated Pipfile.lock (16c839)!
Installing dependencies from Pipfile.lock (16c839)...
  🐍   ▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉ 0/0 — 00:00:00
To activate this project's virtualenv, run pipenv shell.
Alternatively, run a command inside the virtualenv with pipenv run.
```

Виртуальное окружение создано в папке `~/.local/share/virtialenvs/`. 

## Активация

Мы всё ещё находимся в глобальном окружении. В этом можно убедиться вызвав `pip list` и увидим все установленные пакеты. Нам нужно как-то активировать виртуальное окружение. 

Для этого Pipenv создал нам специальные скрипты для разных шеллов. Запускаем скрипт, находясь в папке с проектом:

```
pipenv shell
```

```
Launching subshell in virtual environment...
./home/user/.local/share/virtualenvs/myproject-Ny9jr0AU/bin/activate
```

В командной строке мы теперь видим название виртуального окружения, в которым мы находимся:

```
(myproject) user@hostname: ~/myproject _
```

## Установка пакетов

В Pipenv нужно устанавливать пакеты так:

```
# Устанавливаем пакет requests
pipenv install requests
```

Если нужно установить пакет, который нам нужен только в разработке и не нужен в продакшене, то ставим с флагом `-d`:

```
pipenv install -d pylint
```

Удалить пакет можно командой `uninstall`:

```
pipenv uninstall requests
```

Несколько пакетов можно перечислять через пробел:

```
 # Устанавливаем Flask и Requests
 pipenv install flask requests
```

## Pipfile

При создании окружения в папке с проектом появился файл Pipfile:

```toml
[[source]]
url = "https://pypi.org/simple"
verify_ssl = true
name = "pypi"

[packages]
flask = "*"
flask-sqlalchemy = "*"

[dev-packages]
pylint = "*"

[requires]
python_version = "3.9"
```

* `[[source]]` - источник, откуда скачиваются пакеты. По-умолчанию используется обычный PyPi.
* `[packages]` - установленные пакеты
* `[dev-packages]` - установленные пакеты для разработки
* `[requires]` - требуемая версия Python

Когда мы устанавливаем пакет через `pipenv install` пакет автоматически добавляется в Pipfile. По-сути Pipfile - это прокаченный requirements.txt.

Через знак равно указывается версия пакета. По-умолчанию это звёздочка `*`, что означает последняя версия. Если мы установим какую-то определённую версию, то это отразится и в Pipfile.

```
 pipenv install flask==1.1.2
```

```toml
# в Pipfile
flask = "==1.1.2"
```

## Pipfile.lock

После установки пакетов в папке с проектом также появляется Pipfile.lock. Этот файл трогать не нужно. В нём закрепляются все используемые пакеты, их зависимости, их версии и хэши. 

## Установка пакетов существующего проекта

Pipenv делает установку проекта на новом компьютере/сервере проще. Pipfile и Pipfile.lock следует добавлять в git-репозиторий. Потом при клонировании репозитория на сервере нам будет достаточно установить Pipenv (`pip3 install pipenv`).  Зайдя в папку с проектом, вызываем:

```
pipenv install
```

Pipenv прочитает Pipfile и Pipfile.lock, создаст виртуальное окружение и установит все нужные пакеты и зависимости. 

Если запускать Python нужно без виртуального окружения, то Pipenv может установить пакеты прямо в систему:

```
pipenv install --system
```

Если другой разработчик скачает ваш проект, то он может установить все пакеты, включая те, которые мы указывали как dev-пакеты:

```
pipenv install --dev
```

## Выход и удаление окружение

Чтобы выйти из виртуального окружения, выполняем:

```
exit
```

Удалить виртуальное окружение:

```
pipenv --rm
```

## Минусы Pipenv

К сожалению, Pipenv основывается на `virtualenv`, а не `venv`, что может в определённых ситуациях вызвать проблемы.

Также, процесс закрепления пакетов (`lock`), который происходит после каждой установки пакета, происходит очень долго. Иногда он может занимать какое-то неимоверное количество времени (10-20 минут, если пакеты большие).

## Интеграция в VS Code

Чтобы VS Code нормально распознавал импорты в коде, нужно ему указать на интерпретатор Python, находящийся в нашем окружении.

1. Откройте поле для команд в VS Code, нажав `Ctrl + Shift + P`.
2. Находим **Python: Select Interpreter**.
3. Выбираем интерпретатор из нужного окружения (помечен pipenv).

![image-20201220221624086](/assets/blog/images/image-20201220221624086.png)

Это создаст папку `.vscode` в проекте с информацией об используемом интерпретаторе.

## Дополнительно

Также, Pipenv умеет подгружать переменные окружения из `.env` при активации и проверять пакеты на уязвимости через `pipenv check`. 

## Ссылки:

* [Документация Pipenv](https://docs.pipenv.org/)
* [Документация venv](https://docs.python.org/3/library/venv.html)

## Подписывайтесь в Телеграме, чтобы узнавать о новых полезных постах

Ссылка: **[Telegram канал Rokitsky_ru](https://t.me/rokitsky_ru)**


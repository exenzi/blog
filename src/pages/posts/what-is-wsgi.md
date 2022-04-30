---
setup: |
  import Layout from '../../layouts/BlogPost.astro'
title:  "🦄 Зачем нужен Gunicorn? Что такое WSGI?"
date:   08 May 2021
author: Макс Рокицкий
tags: python nginx wsgi gunicorn
description: Задеплоив своё первое Django-приложение в веб, я столкнулся с тем, что для его работы нужно дополнительно установить... wsgi-сервер? Что это и зачем? И это не считая Nginx, который тоже выполняет роль сервера.
---

Задеплоив своё [первое Django-приложение](https://pysnippets.ru/) в веб, я столкнулся с тем, что для его работы нужно дополнительно установить... wsgi-сервер? Что это и зачем? И это не считая Nginx, который тоже выполняет роль сервера. Я задался вопросом: "Нахрена нам столько приложений, задача которых просто обрабатывать http-запросы и выплёвывать ответы? (nginx, gunicorn, django)".

Поэтому я решил разобраться, зачем нам всё это, как оно работает и при чём тут зелёные единороги.

<!--more-->

## Зарождение формочек

В начале 90-х веб был статичный. По сути, на удалённом компьютере просто была папка с html-страницами (напр. `/var/www/`), в которой работал сервер типа Apache. Когда на сервер приходил запрос, например `example.com/docs/order.html`, сервер искал страницу `/var/www/docs/order.html` и отдавал её клиенту. 

Но разработчикам очень хотелось иметь какую-то возможность обратной связи и аутентификации/авторизации клиентов. Для этого начали использовать скрипты, которые прописывали в атрибуте `action=` html-формы. Для написания скриптов использовался в основном Perl.

```html
<html>
    <head>
    	<title>Form</title>
    </head>
    <body>
        <form action="/cgi-bin/form_handler.pl">
            Name: <input name="firstname" type="text">
            <input type="submit" value="Submit">
        </form>
    </body>
</html>
```

Когда поступал запрос, сервер запускал скрипт и передавал ему данные через переменные окружения. Скрипт обрабатывал запрос и отдавал html серверу через стандартный вывод, а сервер передавал его клиенту.

И всё вроде бы хорошо, веб теперь может не только отдавать данные, но и принимать их. Но есть проблема: каждый разработчик придумывал свои имена переменных окружения, тонкости процесса и т.д. Впоследствии зародилась спецификация [CGI (Common Gateway Interface)](https://en.wikipedia.org/wiki/Common_Gateway_Interface), которая описывает, как это всё должно происходить и называться.

![image-20210508220404857](/assets/blog/images/image-20210508220404857.png)

## WSGI

[WSGI (Web Server Gateway Interface)](https://en.wikipedia.org/wiki/Web_Server_Gateway_Interface) (произносится "Уызги") - стандарт, описывающий процесс запуска и передачи запроса серверами веб-приложениям, написанных на Python. 

```python
def application(environ, start_response):
    start_response('200 OK', [('Content-Type', 'text/plain')])
    yield b'Hello, World!\n'
```

В запускаемом приложении должен существовать вызываемый объект `application`, который принимает переменные окружения `environ` и вызываемый объект `start_response`, через который впоследствии будет передан ответ обратно серверу.

В Django такая функция есть в файле wsgi.py, который джанго генерирует при создании проекта:

```python
# djangoproject/wsgi.py
import os
from django.core.wsgi import get_wsgi_application
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoproject.settings')
application = get_wsgi_application()
```

Суммируя, WSGI - это стандарт того, как общается сервер с приложением на Python.

## Узкое место

Хорошо, допустим у нас есть сервер Apache и приложение на Python, например на фреймворке Django. Казалось, что всё хорошо. Всё, да не всё. У данный системы есть одно узкое место, а именно скорость запуска скрипта. Сам сервер работает быстро, скрипт выполняется тоже быстро. Но сам запуск интерпретатора и скрипта, загрузка этого всего в оперативную память происходит очень медленно и является так называемым "бутылочным горлышком". 

Решением данный проблемы стала предварительная загрузка (префорк) приложения в оперативную память и удержание его там. Соответственно, когда придёт запрос, он будет обработан сразу без ожидания запуска.

Для этого у сервера Apache есть модуль [mod_wsgi](https://ru.wikipedia.org/wiki/Mod_wsgi). 

![image-20210508220853870](/assets/blog/images/image-20210508220853870.png)

## 🦄 Зелёные единороги?

Nginx был создан российским программистом [Игорем Сысоевым](https://ru.wikipedia.org/wiki/%D0%A1%D1%8B%D1%81%D0%BE%D0%B5%D0%B2,_%D0%98%D0%B3%D0%BE%D1%80%D1%8C_%D0%92%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B8%D1%87_(%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%81%D1%82)) в 2004 году и стал очень популярен из-за своей асинхронной архитектуры. Для современных проектов всё чаще используется именно он.

Ещё в 2013 году Nginx стал самым используемым сервером среди топ-1000 сайтов. А 4 мая 2021 года он [обогнал](https://w3techs.com/blog/entry/nginx_is_now_the_most_popular_web_server_overtaking_apache) Apache по популярности в мире. 

![img](https://w3techs.com/pictures/web_server_202105.png)

Nginx не может префоркать wsgi-приложения. Но зато он может выполнять роль [обратного прокси](https://ru.wikipedia.org/wiki/%D0%9E%D0%B1%D1%80%D0%B0%D1%82%D0%BD%D1%8B%D0%B9_%D0%BF%D1%80%D0%BE%D0%BA%D1%81%D0%B8) (reverse proxy), то есть умеет перенаправлять запросы на другой (локальный) сервер. Этот промежуточный сервер должен понимать HTTP, запускать WSGI-приложения и уметь префоркать их. Таким промежуточным сервером и является Gunicorn.

То есть, Gunicorn - это минимальный веб-сервер, задача которого запускать и префоркать наше Python-приложение. Nginx стоит перед ним и когда требуется статичный файл (css, js, png и т.д.), отдаёт его клиенту, а когда нужна работа с динамическим контентом, перенаправляет запрос на Gunicorn, который сообщает детали запроса через стандарт WSGI нашему приложению.

![image-20210508223141717](/assets/blog/images/image-20210508223141717.png)

Такие сервера часто называют Application Server.

Gunicorn (Green Unicorn) является форком проекта Unicorn для Ruby. У Gunicorn есть популярный аналог [uWSGI](https://uwsgi-docs.readthedocs.io/en/latest/).

## А как же `manage.py runserver`

Сервер доступный через manage.py в фреймворке Django годится только для разработки и не должен использоваться для продакшена. Он не оптимален для реальной работы и не обладает достаточной безопасностью. Из документации к команде `runserver`:

> DO NOT USE THIS SERVER IN A PRODUCTION SETTING. It has not gone through security audits or performance tests. (And that’s how it’s gonna stay. We’re in the business of making Web frameworks, not Web servers, so improving this server to be able to handle a production environment is outside the scope of Django.)

* [Документация Gunicorn](https://docs.gunicorn.org/en/latest/index.html)

* [WSGI на Википедии](https://ru.wikipedia.org/wiki/WSGI)

* [CGI на Википедии](https://en.wikipedia.org/wiki/Common_Gateway_Interface)

  


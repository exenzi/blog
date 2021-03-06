---
setup: |
  import Layout from '../../layouts/BlogPost.astro'
title:  "🖥️ mosh - ssh при нестабильном соединении"
date:   23 Apr 2021
author: Макс Рокицкий
tags: ssh mosh linux
description: Так как я живу за городом и соединяться приходится по мобильному соединению, которое весьма нестабильно, ssh иногда меня выкидывает с сервера. Это проблему поможет решить mosh - утилита аналогична ssh, но нацелена как раз на подобные ситуации. Ей не страшны провалы в сети, смены wifi и т.д.
---

Так как я живу за городом и соединяться приходится по мобильному соединению, которое весьма нестабильно, ssh иногда меня выкидывает с сервера. Это проблему поможет решить mosh - утилита аналогична ssh, но нацелена как раз на подобные ситуации. Ей не страшны провалы в сети, смены wifi и т.д.

Работает это примерно так:

1. mosh заходит по ssh на сервер и запускает там mosh-server. Выходит с сервера.
2. На локальной машине запускает mosh-client.

mosh-server слушает udp порты 60000-61000. Так как у нас скорее всего стоит фаервол, нам нужно открыть порт и подключаться конкретно к нему.

Подключаемся по ssh, ставим mosh и открываем порт udp 60000:

```
sudo apt install mosh
sudo ufw allow 60000/udp
```

Выходим с сервера и уже на локальной машине ставим mosh:

```
sudo apt install mosh
```

Теперь можем подключаться не через ssh, а через mosh:

```
mosh user@ipaddress -p 60000
```

* [Сайт Mosh](https://mosh.org/)
* [Статья на Хабре](https://habr.com/ru/post/243651/)


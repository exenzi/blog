---
setup: |
  import Layout from '../../layouts/BlogPost.astro'
title:  "📃 enumarate() - Перебираем списки с нумерацией"
date:   22 Dec 2020
author: Макс Рокицкий
tags: python enumerate list
description: Цикл for перебирает элементы в итерируемых объектах. Ну если нам нужно знать также индекс (номер) элемента, для этого мы используем счётчик.
---

Цикл for перебирает элементы в итерируемых объектах. Ну если нам нужно знать также индекс (номер) элемента, для этого мы используем счётчик.

```python
array = ['Михаил', 'Александр', 'Василий', 'Алексей']
count = 0
for element in array:
    count += 1
    print(count, ':', element)
```

```
1 : Михаил
2 : Александр
3 : Василий
4 : Алексей
```

Знать индекс элемента нужно очень часто, поэтому в Python есть для этого специальная встроенная функция `enumerate()`, которая избавляет нас от надобности использовать счётчик.

<!--more-->

```python
enumerate(iterable, start=0)
```

## Использование

В энумерейт мы можем передать итерируемый объект (строки, списки, сеты, словари, генераторы и т.д.). При переборе, он возвращает картеж состоящий из индекса и самого элемента:

```python
for i in enumerate(array):
    print(i)
```

```
(0, 'Михаил')
(1, 'Александр')
(2, 'Василий')
(3, 'Алексей')
```

Мы можем распаковать этот картеж, если укажем две переменные:

```python
for index, element in enumerate(array):
    print(index, ':', element)
```

```
0 : Михаил
1 : Александр
2 : Василий
3 : Алексей
```

## Начинаем с нужного индекса

Можем заметить, что индекс начинается с нуля, но нам в данном случае нужно выводить его на 1 больше. Мы могли бы прибавлять единицу к индексу: `print(index + 1, ':', element)`, но для этого удобнее использовать ключевой параметр `start` у функции `enumerate`, который по умолчанию равен нулю. Он отвечает за то, с какого номера начинать.

```python
for index, element in enumerate(array, start=1):
    print(index, ':', element)
```

```
1 : Михаил
2 : Александр
3 : Василий
4 : Алексей
```

## Наоборот

Если нужно перебирать наоборот, с последнего элемента до первого, то можем поместить энумерейт во встроенную функцию `sorted()` с параметром `reverse=True`.

```python
for index, element in sorted(enumerate(array, start=1), reverse=True):
    print(index, ':', element)
```

```
4 : Алексей
3 : Василий
2 : Александр
1 : Михаил
```

## Как работает

По-сути энумерейт - это генератор, который отдаёт нам индекс и элемент. То есть добиться того же эффекта можно так:

```python
def enumerate(sequence, start=0):
    n = start
    for elem in sequence:
        yield n, elem
        n += 1
```


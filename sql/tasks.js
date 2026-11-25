// SQL-тренажёр: учебная база «сеть магазинов» и задачи с эталонными решениями.
// База каждый раз создаётся заново и одинаковой: случайные данные с фиксированным зерном.

export const SEED = `
SELECT setseed(0.42);

CREATE TABLE stores (
  store_id  int PRIMARY KEY,
  city      text NOT NULL,
  opened_at date NOT NULL
);
INSERT INTO stores VALUES
 (1,'Москва','2015-03-01'),(2,'Москва','2019-09-15'),(3,'Санкт-Петербург','2016-05-20'),
 (4,'Казань','2018-02-10'),(5,'Екатеринбург','2017-11-01'),(6,'Новосибирск','2020-06-30'),
 (7,'Самара','2021-04-12'),(8,'Нижний Новгород','2022-08-08');

CREATE TABLE customers (
  customer_id   int PRIMARY KEY,
  name          text NOT NULL,
  city          text,            -- бывает NULL
  registered_at date NOT NULL,
  email         text             -- бывает NULL, есть дубли
);
INSERT INTO customers
SELECT i,
  (ARRAY['Анна','Иван','Мария','Олег','Елена','Павел','Ольга','Дмитрий','Наталья','Сергей','Ирина','Алексей'])[1 + i % 12]
   || ' ' || (ARRAY['Смирнов','Кузнецов','Попов','Соколов','Лебедев','Козлов','Новиков','Морозов','Волков','Зайцев'])[1 + (i * 7) % 10],
  CASE WHEN i % 11 = 0 THEN NULL
       ELSE (ARRAY['Москва','Москва','Москва','Санкт-Петербург','Казань','Екатеринбург','Новосибирск','Самара','Нижний Новгород','Тула'])[1 + (i * 3) % 10] END,
  date '2023-01-01' + ((i * 37) % 1090),
  CASE WHEN i % 9 = 0 THEN NULL
       WHEN i IN (43, 51) THEN 'user' || (i - 36) || '@mail.ru'
       ELSE 'user' || i || '@mail.ru' END
FROM generate_series(1, 60) AS i;

CREATE TABLE products (
  product_id int PRIMARY KEY,
  name       text NOT NULL,
  category   text NOT NULL,
  price      numeric(10,2) NOT NULL
);
INSERT INTO products VALUES
 (1,'Смартфон Нова 12','Электроника',34990),(2,'Наушники Тишина','Электроника',7990),
 (3,'Ноутбук Вектор 15','Электроника',68990),(4,'Телевизор Окно 55','Электроника',45990),
 (5,'Планшет Лист 10','Электроника',21990),(6,'Электрочайник Пар','Бытовая техника',2490),
 (7,'Чайник стеклянный Лёд','Бытовая техника',1990),(8,'Пылесос Вихрь','Бытовая техника',12990),
 (9,'Холодильник Север','Бытовая техника',54990),(10,'Микроволновка Луч','Бытовая техника',8490),
 (11,'Кофемашина Утро','Бытовая техника',25990),(12,'Книга «Цель»','Книги',690),
 (13,'Книга «Азбука системного мышления»','Книги',890),(14,'Книга «SQL для аналитиков»','Книги',1290),
 (15,'Книга «Думай медленно»','Книги',990),(16,'Конструктор Город','Игрушки',3990),
 (17,'Пазл 1000 деталей','Игрушки',1190),(18,'Настольная игра Мафия','Игрушки',1490),
 (19,'Радиоуправляемая машина','Игрушки',4590),(20,'Куртка зимняя','Одежда',9990),
 (21,'Шапка вязаная','Одежда',1290.50),(22,'Ботинки трекинговые','Одежда',7490),
 (23,'Термос 1 л','Одежда',1890),(24,'Фотоаппарат Плёнка','Электроника',15990),
 (25,'Мультиварка Каша','Бытовая техника',6990);

CREATE TABLE orders (
  order_id    int PRIMARY KEY,
  customer_id int NOT NULL REFERENCES customers,
  store_id    int REFERENCES stores,   -- NULL = онлайн-заказ
  order_date  date NOT NULL,
  status      text NOT NULL CHECK (status IN ('done','cancelled','returned'))
);
INSERT INTO orders
SELECT i,
  1 + floor(random() * 54)::int,
  CASE WHEN random() < 0.2 THEN NULL ELSE 1 + floor(random() * 8)::int END,
  date '2025-01-01' + floor(random() * 365)::int,
  CASE WHEN r < 0.8 THEN 'done' WHEN r < 0.92 THEN 'cancelled' ELSE 'returned' END
FROM (SELECT i, random() AS r FROM generate_series(1, 400) AS i) s;

CREATE TABLE order_items (
  order_id   int NOT NULL REFERENCES orders,
  product_id int NOT NULL REFERENCES products,
  qty        int NOT NULL,
  price      numeric(10,2) NOT NULL,   -- цена в момент продажи
  PRIMARY KEY (order_id, product_id)
);
INSERT INTO order_items
SELECT DISTINCT ON (o.order_id, p.pid) o.order_id, p.pid, 1 + floor(random() * 3)::int, pr.price
FROM orders o
CROSS JOIN LATERAL (SELECT 1 + floor(random() * 23)::int AS pid FROM generate_series(1, 1 + (o.order_id % 3))) p
JOIN products pr ON pr.product_id = p.pid
ORDER BY o.order_id, p.pid;

CREATE TABLE employees (
  employee_id int PRIMARY KEY,
  name        text NOT NULL,
  manager_id  int REFERENCES employees,
  store_id    int REFERENCES stores,
  salary      int NOT NULL,
  hired_at    date NOT NULL
);
INSERT INTO employees VALUES
 (1,'Громов Виктор',NULL,NULL,320000,'2014-09-01'),
 (2,'Белова Ксения',1,NULL,210000,'2016-02-15'),(3,'Орлов Артём',1,NULL,205000,'2017-07-01'),
 (4,'Савина Юлия',2,1,120000,'2018-03-12'),(5,'Тихонов Роман',2,2,118000,'2019-10-01'),
 (6,'Мельникова Вера',2,3,115000,'2016-06-01'),(7,'Фролов Игорь',3,4,98000,'2018-03-01'),
 (8,'Егорова Дарья',3,5,101000,'2017-12-01'),(9,'Киселёв Денис',3,6,95000,'2020-07-15'),
 (10,'Абрамова Лина',4,1,72000,'2021-01-10'),(11,'Гусев Максим',4,1,69000,'2022-05-05'),
 (12,'Носова Алла',5,2,71000,'2020-03-03'),(13,'Пестов Олег',6,3,66000,'2023-02-20'),
 (14,'Рябова Ника',7,4,64000,'2021-09-09'),(15,'Соловьёв Илья',8,5,67000,'2019-11-11'),
 (16,'Титова Ева',9,6,63000,'2022-12-01'),(17,'Уткин Глеб',2,7,99000,'2021-04-12'),
 (18,'Федорова Яна',17,7,61000,'2023-06-01'),(19,'Хохлов Пётр',3,8,97000,'2022-08-08'),
 (20,'Шилова Майя',19,8,60000,'2024-01-15');

CREATE TABLE stock (
  store_id   int NOT NULL REFERENCES stores,
  product_id int NOT NULL REFERENCES products,
  qty        int NOT NULL,
  PRIMARY KEY (store_id, product_id)
);
INSERT INTO stock
SELECT s, p, CASE WHEN random() < 0.12 THEN 0 ELSE floor(random() * 31)::int END
FROM generate_series(1, 8) s CROSS JOIN generate_series(1, 25) p;
`;

// level: 1 — база, 2 — средний, 3 — сложный. ordered: важен ли порядок строк.
// check: для задач на изменение данных — запрос, которым проверяется результат.
export const TASKS = [
  // ---------- Основы
  { id: "b1", topic: "Основы", level: 1, ordered: true,
    title: "Дорогая электроника",
    text: "Выведите название и цену товаров категории «Электроника» дороже 20 000 ₽, от самого дорогого к дешёвому.",
    hint: "WHERE с двумя условиями через AND, ORDER BY ... DESC.",
    solution: "SELECT name, price FROM products WHERE category = 'Электроника' AND price > 20000 ORDER BY price DESC;" },
  { id: "b2", topic: "Основы", level: 1,
    title: "Новички 2025 года",
    text: "Сколько покупателей зарегистрировалось в 2025 году? Один столбец — количество.",
    hint: "COUNT(*) и условие на диапазон дат: >= '2025-01-01' AND < '2026-01-01'.",
    solution: "SELECT count(*) FROM customers WHERE registered_at >= '2025-01-01' AND registered_at < '2026-01-01';" },
  { id: "b3", topic: "Основы", level: 1,
    title: "Без почты",
    text: "Выведите id и имя покупателей, у которых не указан email.",
    hint: "Сравнение с NULL через = не работает. Нужно IS NULL.",
    solution: "SELECT customer_id, name FROM customers WHERE email IS NULL;" },
  { id: "b4", topic: "Основы", level: 1, ordered: true,
    title: "Города покупателей",
    text: "Выведите список уникальных городов покупателей по алфавиту. Пустые города не выводите.",
    hint: "DISTINCT, WHERE city IS NOT NULL, ORDER BY.",
    solution: "SELECT DISTINCT city FROM customers WHERE city IS NOT NULL ORDER BY city;" },
  { id: "b5", topic: "Основы", level: 1,
    title: "Проблемные заказы декабря",
    text: "Выведите id и статус заказов декабря 2025 года со статусом «cancelled» или «returned».",
    hint: "status IN (...) и диапазон дат.",
    solution: "SELECT order_id, status FROM orders WHERE status IN ('cancelled','returned') AND order_date >= '2025-12-01' AND order_date < '2026-01-01';" },
  { id: "b6", topic: "Основы", level: 1,
    title: "Все чайники",
    text: "Найдите товары, в названии которых есть слово «чайник» в любом регистре. Выведите id и название.",
    hint: "В PostgreSQL есть ILIKE — LIKE без учёта регистра.",
    solution: "SELECT product_id, name FROM products WHERE name ILIKE '%чайник%';" },

  // ---------- JOIN
  { id: "j1", topic: "JOIN", level: 1,
    title: "Где сделан заказ",
    text: "Для каждого заказа декабря 2025 выведите id заказа, имя покупателя и город магазина. Для онлайн-заказов (store_id пустой) в городе напишите «онлайн».",
    hint: "JOIN с покупателями, LEFT JOIN с магазинами, COALESCE(город, 'онлайн').",
    solution: "SELECT o.order_id, c.name, COALESCE(s.city, 'онлайн') AS city FROM orders o JOIN customers c USING (customer_id) LEFT JOIN stores s USING (store_id) WHERE o.order_date >= '2025-12-01';" },
  { id: "j2", topic: "JOIN", level: 2,
    title: "Ни одного заказа",
    text: "Выведите id и имя покупателей, которые ни разу ничего не заказывали.",
    hint: "LEFT JOIN заказов и WHERE o.order_id IS NULL — или NOT EXISTS.",
    solution: "SELECT c.customer_id, c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);" },
  { id: "j3", topic: "JOIN", level: 2,
    title: "Товары без продаж",
    text: "Какие товары ни разу не продавались? Выведите id и название.",
    hint: "Та же идея, что и в предыдущей задаче, только с order_items.",
    solution: "SELECT p.product_id, p.name FROM products p LEFT JOIN order_items oi USING (product_id) WHERE oi.order_id IS NULL;" },
  { id: "j4", topic: "JOIN", level: 2,
    title: "Кто чей начальник",
    text: "Выведите имя каждого сотрудника и имя его руководителя. У директора руководителя нет — там должен быть NULL.",
    hint: "Таблица соединяется сама с собой: employees e LEFT JOIN employees m ON m.employee_id = e.manager_id.",
    solution: "SELECT e.name, m.name AS manager FROM employees e LEFT JOIN employees m ON m.employee_id = e.manager_id;" },

  // ---------- Группировка
  { id: "g1", topic: "Группировка", level: 1,
    title: "Выручка магазинов",
    text: "Посчитайте выручку каждого магазина по выполненным заказам (status = 'done'): store_id и сумма qty × price. Онлайн-заказы не учитывайте.",
    hint: "JOIN orders и order_items, WHERE status = 'done' AND store_id IS NOT NULL, GROUP BY store_id.",
    solution: "SELECT o.store_id, sum(oi.qty * oi.price) AS revenue FROM orders o JOIN order_items oi USING (order_id) WHERE o.status = 'done' AND o.store_id IS NOT NULL GROUP BY o.store_id;" },
  { id: "g2", topic: "Группировка", level: 1,
    title: "Дорогие категории",
    text: "Выведите категории, где средняя цена товара больше 10 000 ₽, и эту среднюю цену, округлённую до рубля.",
    hint: "Условие на агрегат — в HAVING, а не в WHERE.",
    solution: "SELECT category, round(avg(price)) FROM products GROUP BY category HAVING avg(price) > 10000;" },
  { id: "g3", topic: "Группировка", level: 2, ordered: true,
    title: "Топ-5 покупателей",
    text: "Пять покупателей с наибольшей суммой выполненных заказов: customer_id и сумма. По убыванию суммы.",
    hint: "GROUP BY customer_id, ORDER BY сумма DESC, LIMIT 5.",
    solution: "SELECT o.customer_id, sum(oi.qty * oi.price) AS total FROM orders o JOIN order_items oi USING (order_id) WHERE o.status = 'done' GROUP BY o.customer_id ORDER BY total DESC, o.customer_id LIMIT 5;" },
  { id: "g4", topic: "Группировка", level: 2, ordered: true,
    title: "Заказы по месяцам",
    text: "Сколько заказов было в каждом месяце 2025 года? Столбцы: месяц (первое число месяца, тип date) и количество. По порядку месяцев.",
    hint: "date_trunc('month', order_date)::date.",
    solution: "SELECT date_trunc('month', order_date)::date AS month, count(*) FROM orders GROUP BY 1 ORDER BY 1;" },
  { id: "g5", topic: "Группировка", level: 2,
    title: "Доля отмен",
    text: "Для каждого магазина (только офлайн) посчитайте долю отменённых заказов в процентах, с одним знаком после запятой: store_id и процент.",
    hint: "count(*) FILTER (WHERE status = 'cancelled') * 100.0 / count(*), round(..., 1).",
    solution: "SELECT store_id, round(count(*) FILTER (WHERE status = 'cancelled') * 100.0 / count(*), 1) FROM orders WHERE store_id IS NOT NULL GROUP BY store_id;" },

  // ---------- Подзапросы и CTE
  { id: "s1", topic: "Подзапросы и CTE", level: 2,
    title: "Дороже среднего по категории",
    text: "Выведите товары, которые дороже средней цены своей категории: название, категория, цена.",
    hint: "Коррелированный подзапрос: price > (SELECT avg(price) FROM products p2 WHERE p2.category = p.category).",
    solution: "SELECT name, category, price FROM products p WHERE price > (SELECT avg(price) FROM products p2 WHERE p2.category = p.category);" },
  { id: "s2", topic: "Подзапросы и CTE", level: 2,
    title: "Идеальные покупатели",
    text: "Найдите покупателей, у которых есть заказы, и все они выполнены (ни одного cancelled или returned). Выведите customer_id.",
    hint: "Есть заказ — EXISTS, нет плохих — NOT EXISTS. Или GROUP BY с bool_and(status = 'done').",
    solution: "SELECT customer_id FROM orders GROUP BY customer_id HAVING bool_and(status = 'done');" },
  { id: "s3", topic: "Подзапросы и CTE", level: 2,
    title: "Средний чек",
    text: "Посчитайте средний чек по выполненным заказам: сумма заказа = qty × price по всем позициям. Округлите до копеек.",
    hint: "Сначала в CTE посчитайте сумму каждого заказа, потом avg по ним.",
    solution: "WITH t AS (SELECT o.order_id, sum(oi.qty * oi.price) AS total FROM orders o JOIN order_items oi USING (order_id) WHERE o.status = 'done' GROUP BY o.order_id) SELECT round(avg(total), 2) FROM t;" },

  // ---------- Оконные функции
  { id: "w1", topic: "Оконные функции", level: 2,
    title: "Какой по счёту заказ",
    text: "Для каждого заказа выведите customer_id, order_id и его номер по порядку у этого покупателя (по дате, при равной дате — по order_id).",
    hint: "row_number() OVER (PARTITION BY customer_id ORDER BY order_date, order_id).",
    solution: "SELECT customer_id, order_id, row_number() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) FROM orders;" },
  { id: "w2", topic: "Оконные функции", level: 2,
    title: "Самый дорогой в категории",
    text: "Для каждой категории выведите самый дорогой товар: категория, название, цена.",
    hint: "rank() OVER (PARTITION BY category ORDER BY price DESC) в подзапросе, снаружи — WHERE rank = 1. Или DISTINCT ON.",
    solution: "SELECT category, name, price FROM (SELECT *, rank() OVER (PARTITION BY category ORDER BY price DESC) r FROM products) t WHERE r = 1;" },
  { id: "w3", topic: "Оконные функции", level: 3, ordered: true,
    title: "Выручка нарастающим итогом",
    text: "Для каждого дня декабря 2025, когда были выполненные заказы, выведите дату, выручку дня и выручку нарастающим итогом с начала месяца. По порядку дат.",
    hint: "Сначала GROUP BY по дню, потом sum(выручка) OVER (ORDER BY дата).",
    solution: "WITH d AS (SELECT o.order_date, sum(oi.qty * oi.price) AS rev FROM orders o JOIN order_items oi USING (order_id) WHERE o.status = 'done' AND o.order_date >= '2025-12-01' GROUP BY o.order_date) SELECT order_date, rev, sum(rev) OVER (ORDER BY order_date) FROM d ORDER BY order_date;" },
  { id: "w4", topic: "Оконные функции", level: 3,
    title: "Пауза между заказами",
    text: "Для каждого заказа выведите customer_id, order_id и сколько дней прошло с предыдущего заказа этого покупателя (для первого — NULL). Порядок заказов — по дате, затем по order_id.",
    hint: "order_date - lag(order_date) OVER (PARTITION BY customer_id ORDER BY order_date, order_id).",
    solution: "SELECT customer_id, order_id, order_date - lag(order_date) OVER (PARTITION BY customer_id ORDER BY order_date, order_id) FROM orders;" },
  { id: "w5", topic: "Оконные функции", level: 3,
    title: "Топ-3 в каждой категории",
    text: "Для каждой категории — три товара с наибольшей выручкой по выполненным заказам: категория, название, выручка. При равной выручке выше тот, у кого меньше product_id.",
    hint: "Выручку по товару — в CTE, затем row_number() OVER (PARTITION BY category ORDER BY выручка DESC, product_id) <= 3.",
    solution: "WITH r AS (SELECT p.product_id, p.category, p.name, sum(oi.qty * oi.price) AS rev FROM order_items oi JOIN orders o USING (order_id) JOIN products p USING (product_id) WHERE o.status = 'done' GROUP BY p.product_id), n AS (SELECT *, row_number() OVER (PARTITION BY category ORDER BY rev DESC, product_id) rn FROM r) SELECT category, name, rev FROM n WHERE rn <= 3;" },
  { id: "w6", topic: "Оконные функции", level: 3,
    title: "Доля категории",
    text: "Какую долю общей выручки (выполненные заказы) даёт каждая категория? Категория и процент с одним знаком после запятой.",
    hint: "sum(выручка) OVER () — сумма по всем строкам без группировки окна.",
    solution: "WITH c AS (SELECT p.category, sum(oi.qty * oi.price) AS rev FROM order_items oi JOIN orders o USING (order_id) JOIN products p USING (product_id) WHERE o.status = 'done' GROUP BY p.category) SELECT category, round(rev * 100 / sum(rev) OVER (), 1) FROM c;" },

  // ---------- Особенности PostgreSQL и ловушки
  { id: "p1", topic: "PostgreSQL и ловушки", level: 2,
    title: "Последний заказ",
    text: "Для каждого покупателя выведите его последний заказ: customer_id, order_id, дата. При нескольких заказах в один день — с большим order_id.",
    hint: "В PostgreSQL есть DISTINCT ON (customer_id) ... ORDER BY customer_id, order_date DESC, order_id DESC.",
    solution: "SELECT DISTINCT ON (customer_id) customer_id, order_id, order_date FROM orders ORDER BY customer_id, order_date DESC, order_id DESC;" },
  { id: "p2", topic: "PostgreSQL и ловушки", level: 2,
    title: "Дубли почты",
    text: "Найдите email, которые указаны у нескольких покупателей. Выведите email и сколько раз он встречается.",
    hint: "GROUP BY email HAVING count(*) > 1. Не забудьте, что NULL — не дубль.",
    solution: "SELECT email, count(*) FROM customers WHERE email IS NOT NULL GROUP BY email HAVING count(*) > 1;" },
  { id: "p3", topic: "PostgreSQL и ловушки", level: 2,
    title: "Ловушка NULL",
    text: "Сколько покупателей НЕ из Москвы? Те, у кого город не указан, тоже не из Москвы — их надо посчитать.",
    hint: "city <> 'Москва' не вернёт строки с NULL. Нужно city IS DISTINCT FROM 'Москва' или OR city IS NULL.",
    solution: "SELECT count(*) FROM customers WHERE city IS DISTINCT FROM 'Москва';" },
  { id: "p4", topic: "PostgreSQL и ловушки", level: 3,
    title: "Вся вертикаль",
    text: "Выведите всех подчинённых директора (employee_id = 1) на всех уровнях: id, имя и уровень (прямые подчинённые — 1, их подчинённые — 2 и т. д.).",
    hint: "WITH RECURSIVE: стартовая часть — прямые подчинённые, рекурсивная — JOIN к уже найденным по manager_id.",
    solution: "WITH RECURSIVE t AS (SELECT employee_id, name, 1 AS lvl FROM employees WHERE manager_id = 1 UNION ALL SELECT e.employee_id, e.name, t.lvl + 1 FROM employees e JOIN t ON e.manager_id = t.employee_id) SELECT * FROM t;" },
  { id: "p5", topic: "PostgreSQL и ловушки", level: 3, ordered: true,
    title: "Дни без продаж",
    text: "В какие дни декабря 2025 не было ни одного заказа? Выведите даты по порядку.",
    hint: "generate_series('2025-12-01'::date, '2025-12-31', '1 day') и LEFT JOIN к заказам.",
    solution: "SELECT d::date FROM generate_series('2025-12-01'::date, '2025-12-31'::date, '1 day') d WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_date = d::date) ORDER BY 1;" },
  { id: "p6", topic: "PostgreSQL и ловушки", level: 3,
    title: "Перераспределение остатков",
    text: "Найдите пары магазинов для перемещения товара: в магазине-получателе остаток товара меньше 3, а в магазине-доноре того же товара больше 25. Выведите product_id, магазин-донор, магазин-получатель.",
    hint: "Таблица stock соединяется сама с собой по product_id с разными store_id.",
    solution: "SELECT a.product_id, a.store_id AS donor, b.store_id AS receiver FROM stock a JOIN stock b ON a.product_id = b.product_id AND a.store_id <> b.store_id WHERE a.qty > 25 AND b.qty < 3;" },

  // ---------- Изменение данных (проверяется итог, все изменения откатываются)
  { id: "d1", topic: "Изменение данных", level: 1,
    title: "Книги подорожали",
    text: "Повысьте цены всех книг на 10% и округлите до копеек. (Все изменения в тренажёре откатываются — можно экспериментировать.)",
    hint: "UPDATE products SET price = round(price * 1.1, 2) WHERE category = 'Книги';",
    solution: "UPDATE products SET price = round(price * 1.1, 2) WHERE category = 'Книги';",
    check: "SELECT product_id, price FROM products ORDER BY product_id;" },
  { id: "d2", topic: "Изменение данных", level: 1,
    title: "Убрать пустые остатки",
    text: "Удалите из stock все строки с нулевым остатком.",
    hint: "DELETE FROM ... WHERE ...",
    solution: "DELETE FROM stock WHERE qty = 0;",
    check: "SELECT count(*), sum(qty) FROM stock;" },
  { id: "d3", topic: "Изменение данных", level: 2,
    title: "Новый магазин",
    text: "Добавьте магазин № 9 в Туле, открыт 1 декабря 2025 года, и заведите для него остатки по всем товарам категории «Книги» — по 10 штук.",
    hint: "Два запроса: INSERT INTO stores VALUES (...); и INSERT INTO stock SELECT 9, product_id, 10 FROM products WHERE ...;",
    solution: "INSERT INTO stores VALUES (9, 'Тула', '2025-12-01'); INSERT INTO stock SELECT 9, product_id, 10 FROM products WHERE category = 'Книги';",
    check: "SELECT s.city, s.opened_at, count(st.product_id), sum(st.qty) FROM stores s LEFT JOIN stock st USING (store_id) WHERE s.store_id = 9 GROUP BY s.city, s.opened_at;" },
];

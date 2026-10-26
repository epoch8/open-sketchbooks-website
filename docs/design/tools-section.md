# Design doc — раздел Tools на open-sketchbook.place

**Статус:** draft
**Дата:** 2026-10-26
**Автор:** Olga Tatarinova (+ Claude)
**Проект:** open-sketchbooks-website (Astro SSR, open-sketchbook.place)
**Первый тул:** Enmy temperature ramp v4f

---

## Контекст / задача

Ребята попросили выложить на сайт интерактивный инструмент — Enmy temperature ramp
(подбор палитры сцены под набор маркеров Enmy: свет, свечение, контакт, тень, сцена-кубик
и сцена-лицо, экспорт палитры в PDF). У Olga таких тулов уже целая пачка (swatch card,
photo-to-markers, copic-match, hue-ladders и другие), поэтому заводим не одну страницу, а
раздел Tools, готовый принять следующие инструменты без ручной пересборки каждый раз.

Сайт — Astro 6, `output: server`, node-adapter, контент на content collections
(artists, works, events, sketchbooks, products). Есть дизайн-система (`tokens.css`,
`components.css`, `ui.css`), навигация из `src/content/template/navigation/navigation.ts`,
интерьерные страницы собираются через `InternalLayout` + `CardGrid`/`CardGridItem`.

Каждый тул — самодостаточный HTML-файл (vanilla JS + inline SVG, без сборки и внешних
зависимостей). Это важно: движок тула переносить и переписывать не нужно, он кладётся как
есть и работает в любом окружении.

## Решения (развилки закрыты)

1. **Версия тула — v4f (стабильная).** Свет, свечение, контакт, тень, сцена-кубик +
   сцена-лицо, экспорт палитры в PDF. Без Copic-экспериментов (v4g/v4h остаются
   экспериментальными форками в волте). Это та версия, что уже лежит артефактом
   `enmy-temp-ramp-v4f` и в волте.
2. **Встройка — iframe в обёртке сайта.** Тул-файл кладётся в `public/` как есть; Astro-
   страница даёт ему шапку сайта, SEO/OG и короткое интро сверху, а сам тул показывается
   во full-bleed iframe. Движок тула не трогаем. Плюс — ссылка «открыть на весь экран» на
   сырой файл (для максимума места и чистого PDF-экспорта).
3. **Масштаб — полноценная коллекция Tools.** Content collection `tools` по образцу
   sketchbooks/events: индекс `/tools` со списком карточек + страницы `/tools/[slug]`.
   Пункт Tools в главной навигации.
4. **Язык интерфейса — английский.** Сайт на английском, поэтому весь UI тула (кнопки,
   подписи линеек, подсказки, легенды сцены, названия зон, статусы) переводится на
   английский. На сайт выкладывается английская версия; русский мастер остаётся в волте.

## Модель данных: collection `tools`

Добавить в `src/content.config.ts` новую коллекцию. Markdown-файлы в `src/content/tools/`,
тело файла — опциональное «about / как пользоваться» (рендерится на странице тула).

```ts
const tools = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/tools" }),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),      // одна строка: карточки + meta description
    author: z.string().default("Olga Tatarinova"),
    published: z.boolean().default(false),
    order: z.number().int().optional(),   // порядок на индексе
    tags: z.array(z.string()).default([]),
    src: z.string().min(1),          // путь к self-contained html в public/
    cover: z.string().optional(),    // превью-картинка для карточки и OG
    credit: z.string().optional(),   // «для набора Enmy, 80 маркеров»
    uiLang: z.enum(["en", "ru"]).default("en"), // язык интерфейса тула
  }),
});
```

И зарегистрировать в `export const collections = { … tools }`.

Карточка первого тула — `src/content/tools/enmy-temperature-ramp.md`:

```md
---
title: "Enmy temperature ramp"
summary: "Build a scene palette for the Enmy acrylic marker set — light, glow, contact and shadow, on a cube and a face."
src: "/tools/enmy-temperature-ramp/index.html"
cover: "/tools/enmy-temperature-ramp/cover.png"
credit: "Built for the Enmy 80-marker acrylic set"
uiLang: "en"
published: true
order: 1
tags: ["color", "markers", "palette"]
---

Короткое intro на английском: что это, для кого, как пользоваться.
```

## Роутинг и страницы

**`src/pages/tools/index.astro`** — индекс раздела. По образцу `events/index.astro`:
`InternalLayout` + `SEOBase`/`pageSEO` + `CardGrid`/`CardGridItem`. Берём
`getCollection("tools")`, фильтруем `published`, сортируем по `order`, рендерим карточки
(title, summary как text, href `/tools/<id>`, buttonLabel «Open»). Если есть `cover` —
показываем превью (CardGridItem при необходимости расширить полем image, либо своя карточка).

**`src/pages/tools/[slug].astro`** — страница тула:

- `getStaticPaths` (или SSR-резолв по slug, как в events/[slug]) из коллекции `tools`.
- `InternalLayout` с nav/footer/SEO; `pageSEO` из `title` + `summary`, canonical
  `https://open-sketchbook.place/tools/<slug>`, og.image = `cover`.
- Контент страницы: `<h1>` + intro (тело markdown через `render()`), под ним — панель
  действий («Open full screen ↗» на `entry.data.src`), затем full-bleed iframe.
- iframe: `src={entry.data.src}`, `width:100%`, большая высота (`min-height: calc(100vh - ~160px)`
  или фикс ~1400px с внутренним скроллом тула), `loading="lazy"`,
  `allow="clipboard-write"`, скролл разрешён. Тот же origin (public/), sandbox не обязателен;
  если ставим — `allow-scripts allow-same-origin allow-popups allow-downloads`.

## Файл тула

- Положить v4f как `public/tools/enmy-temperature-ramp/index.html` (копия из волта
  `Enmy temperature ramp v4f (линейка свечения).html`, самодостаточный HTML — ничего не
  переписываем).
- Проверить, что внутри нет артефактных обёрток (meta-скрипта cowork) — у версии из волта
  их нет, но при копировании глянуть.
- `cover.png` — скриншот тула для карточки и OG (сделать через Playwright, ~1200×630).

## Локализация UI на английский

Весь интерфейс тула переводится на английский. Русский мастер (v4f) остаётся в волте,
английская версия — отдельная копия в `public/tools/enmy-temperature-ramp/index.html`.

Что перевести (строки разбросаны по JS-темплейтам и HTML внутри файла):

- Заголовок и вводный абзац, подписи баров и контролов (объекты, свет, характер/сила,
  режим сцены, слайдеры и их подсказки).
- Названия линеек и зон: свет, свечение, контакт, тень; блик, свет, полутень, собств.тень,
  рефлекс; горение, рим, пик, глубина.
- Легенды и подписи сцен (кубик и лицо): источник света, терминатор/линия касания,
  падающая тень, «что реально положишь набором», истинные цвета/эталон и т.п.
- Кнопки и статусы: экспорт в PDF, сброс, подписи градиентов, служебные сообщения.
- Проверить числовой/типографский формат под английский (десятичная точка уже точка).

Подход: аккуратный проход по строкам в файле (sed/скрипт по словарю RU→EN либо ручная
правка темплейтов), затем визуальная проверка в Playwright — снять скриншоты кубика, лица
и линеек, убедиться, что подписи не ломают вёрстку (английские строки длиннее — следить за
переполнением ячеек и бейджей).

Риск/долг: при будущих правках мастера в волте английскую копию надо будет
синхронизировать вручную — расхождение версий. Для v1 приемлемо; если тулов станет много,
отдельной задачей вынести строки в словарь и собирать языковые версии из одного исходника.

## Навигация

В `src/content/template/navigation/navigation.ts`:

- `mainNav`: добавить `{ label: "Tools", href: "/tools", description: "Interactive tools for artists", enabled: true }`.
- `footerNav` → секция «Sketchbooks» (сейчас Artists/Events): добавить пункт Tools, либо
  оставить только в main — на выбор.

## SEO / OG

- Индекс и каждая страница тула получают свой title/description из frontmatter.
- OG-картинка тула — статический скриншот (`cover.png`) на первом шаге. Позже можно
  подключить к существующему OG-пайплайну (`scripts/generate-og*`), но для v1 статики хватит.
- Тул в iframe индексируется как отдельный файл в public/. Чтобы не плодить дубли в выдаче,
  можно добавить `X-Robots-Tag: noindex` на `/tools/*/index.html` или `robots.txt`-правило —
  каноничная страница это Astro-обёртка `/tools/<slug>`, а не сырой html.

## Адаптив

Тул рассчитан на ширину (несколько панелей, min-width у блоков). На узких экранах iframe
даёт внутренний горизонтальный скролл — это ок для инструмента художника. Ссылка «на весь
экран» закрывает и мобильный кейс, и чистый PDF-экспорт (window.print внутри iframe печатает
iframe; из fullscreen — чище).

## Что тронуть (итог)

- `src/content.config.ts` — коллекция `tools` + регистрация.
- `src/content/tools/enmy-temperature-ramp.md` — карточка первого тула.
- `public/tools/enmy-temperature-ramp/index.html` — сам тул (v4f), **UI переведён на английский**.
- `public/tools/enmy-temperature-ramp/cover.png` — превью/OG (снять уже с английского UI).
- `src/pages/tools/index.astro` — индекс раздела.
- `src/pages/tools/[slug].astro` — страница тула с iframe.
- `src/content/template/navigation/navigation.ts` — пункт Tools.
- (опц.) `CardGridItem.astro` — поддержка превью-картинки, если хотим обложки на индексе.

## Размер работы

Средний. Две Astro-страницы по готовым образцам (events) + схема коллекции + копия файла +
скриншот — это пол-дня. Плюс перевод UI тула на английский с визуальной проверкой вёрстки
(английские строки длиннее) — ещё примерно столько же. Движок/логику тула не трогаем,
только строки. Итого ~день с проверкой сборки (`astro check`, `astro build`) и прогоном
iframe на десктопе и мобиле.

## Acceptance

- `/tools` показывает карточку Enmy ramp (и готов к добавлению следующих тулов одной md-карточкой).
- `/tools/enmy-temperature-ramp` открывается с шапкой и футером сайта, своим SEO/OG, интро
  сверху и рабочим тулом в iframe.
- Кнопка «Open full screen» открывает тул на весь экран; PDF-экспорт из full-screen работает.
- Пункт Tools виден в главной навигации.
- **Весь UI тула на английском** — ни одной русской подписи в кнопках, линейках, легендах
  сцен, подсказках и статусах; английские подписи не ломают вёрстку.
- `astro check` и `astro build` проходят без ошибок.

## Открытые вопросы

1. **Обложки на индексе.** Делаем превью-картинки (нужен скриншот на каждый тул) или
   текстовые карточки как у events? Для одного тула можно начать с текстовой + добавить cover.
2. **Атрибуция/лицензия.** Указывать ли на странице авторство тула и условия использования
   (это инструмент Olga). В футере платформа уже подписана.

*(Язык интерфейса закрыт — решение №4: весь UI тула переводится на английский.)*

## Changelog

- **2026-10-26 v1** — draft. Зафиксированы три решения (v4f · iframe-обёртка · коллекция
  Tools), модель данных, роутинг, встройка, список файлов, acceptance. Согласовано с Olga
  в чате (развилки через AskUserQuestion).
- **2026-10-26 v2** — решение №4: весь UI тула переводится на английский (сайт английский).
  Добавлена секция «Локализация UI», обновлены файлы/acceptance/размер работы; открытый
  вопрос про язык закрыт.

declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"docs": {
"01-concepts/01-why-classic-rag-fails.md": {
	id: "01-concepts/01-why-classic-rag-fails.md";
  slug: "01-concepts/01-why-classic-rag-fails";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"01-concepts/20-semantic-rag-overview.md": {
	id: "01-concepts/20-semantic-rag-overview.md";
  slug: "01-concepts/20-semantic-rag-overview";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"01-concepts/21-data-for-vedana.md": {
	id: "01-concepts/21-data-for-vedana.md";
  slug: "01-concepts/21-data-for-vedana";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"01-concepts/22-data-model-for-vedana.md": {
	id: "01-concepts/22-data-model-for-vedana.md";
  slug: "01-concepts/22-data-model-for-vedana";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"01-concepts/23-tools-for-vedana.md": {
	id: "01-concepts/23-tools-for-vedana.md";
  slug: "01-concepts/23-tools-for-vedana";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"01-concepts/24-playbook-for-vedana.md": {
	id: "01-concepts/24-playbook-for-vedana.md";
  slug: "01-concepts/24-playbook-for-vedana";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"02-preparing-data-for-vedana/01-documents-and-document-chunks.md": {
	id: "02-preparing-data-for-vedana/01-documents-and-document-chunks.md";
  slug: "02-preparing-data-for-vedana/01-documents-and-document-chunks";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"02-preparing-data-for-vedana/02-questions-and-answers.md": {
	id: "02-preparing-data-for-vedana/02-questions-and-answers.md";
  slug: "02-preparing-data-for-vedana/02-questions-and-answers";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"02-preparing-data-for-vedana/03-adding-structured-data.md": {
	id: "02-preparing-data-for-vedana/03-adding-structured-data.md";
  slug: "02-preparing-data-for-vedana/03-adding-structured-data";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"03-data-model/01-anchors.md": {
	id: "03-data-model/01-anchors.md";
  slug: "03-data-model/01-anchors";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"03-data-model/02-attributes.md": {
	id: "03-data-model/02-attributes.md";
  slug: "03-data-model/02-attributes";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"03-data-model/03-links.md": {
	id: "03-data-model/03-links.md";
  slug: "03-data-model/03-links";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"04-self-host/01-quickstart.md": {
	id: "04-self-host/01-quickstart.md";
  slug: "04-self-host/01-quickstart";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../../src/content/config.js");
}

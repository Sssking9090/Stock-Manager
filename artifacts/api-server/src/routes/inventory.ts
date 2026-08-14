import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, inventoryItemsTable } from "@workspace/db";
import {
  CreateInventoryItemBody,
  CreateInventoryItemResponse,
  DeleteInventoryItemParams,
  GetInventoryItemParams,
  GetInventoryItemResponse,
  GetInventorySummaryResponse,
  GetSimilarInventoryItemsParams,
  GetSimilarInventoryItemsResponse,
  ListInventoryItemsQueryParams,
  ListInventoryItemsResponse,
  UpdateInventoryItemBody,
  UpdateInventoryItemParams,
  UpdateInventoryItemResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const itemSearchFields = [
  inventoryItemsTable.name,
  inventoryItemsTable.partNumber,
  inventoryItemsTable.category,
  inventoryItemsTable.subcategory,
  inventoryItemsTable.description,
  inventoryItemsTable.manufacturer,
  inventoryItemsTable.location,
  inventoryItemsTable.unit,
];

const dimensionSearchFields = [
  sql<string>`replace(lower(cast(${inventoryItemsTable.length} as text) || ${inventoryItemsTable.unit}), ' ', '')`,
  sql<string>`replace(lower(cast(${inventoryItemsTable.width} as text) || ${inventoryItemsTable.unit}), ' ', '')`,
  sql<string>`replace(lower(cast(${inventoryItemsTable.height} as text) || ${inventoryItemsTable.unit}), ' ', '')`,
  sql<string>`replace(lower(cast(${inventoryItemsTable.diameter} as text) || ${inventoryItemsTable.unit}), ' ', '')`,
  sql<string>`replace(lower(cast(${inventoryItemsTable.headWidth} as text) || ${inventoryItemsTable.unit}), ' ', '')`,
];

router.get("/inventory/items", async (req, res): Promise<void> => {
  const parsed = ListInventoryItemsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { search, category, subcategory } = parsed.data;
  const filters = [];

  if (search?.trim()) {
    const normalizedSearch = search.trim().replace(/\s+/g, "").toLowerCase();
    filters.push(
      or(
        ...itemSearchFields.map((field) => ilike(field, `%${search.trim()}%`)),
        ...dimensionSearchFields.map((field) =>
          ilike(field, `%${normalizedSearch}%`),
        ),
      ),
    );
  }
  if (category) {
    filters.push(eq(inventoryItemsTable.category, category));
  }
  if (subcategory) {
    filters.push(eq(inventoryItemsTable.subcategory, subcategory));
  }

  const items = await db
    .select()
    .from(inventoryItemsTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(asc(inventoryItemsTable.name));

  res.json(ListInventoryItemsResponse.parse(items));
});

router.post("/inventory/items", async (req, res): Promise<void> => {
  const parsed = CreateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .insert(inventoryItemsTable)
    .values({
      ...parsed.data,
      subcategory: parsed.data.subcategory ?? null,
      description: parsed.data.description ?? null,
      manufacturer: parsed.data.manufacturer ?? null,
      length: parsed.data.length ?? null,
      width: parsed.data.width ?? null,
      height: parsed.data.height ?? null,
      diameter: parsed.data.diameter ?? null,
      headWidth: parsed.data.headWidth ?? null,
      unit: parsed.data.unit ?? "mm",
      imageUrl: parsed.data.imageUrl ?? null,
    })
    .returning();

  res.status(201).json(CreateInventoryItemResponse.parse(item));
});

router.get("/inventory/summary", async (_req, res): Promise<void> => {
  const [totals] = await db
    .select({
      totalItems: sql<number>`count(*)`,
      totalUnits: sql<number>`coalesce(sum(${inventoryItemsTable.quantity}), 0)`,
    })
    .from(inventoryItemsTable);
  const categories = await db
    .select({
      name: inventoryItemsTable.category,
      itemCount: sql<number>`count(*)`,
      unitCount: sql<number>`coalesce(sum(${inventoryItemsTable.quantity}), 0)`,
    })
    .from(inventoryItemsTable)
    .groupBy(inventoryItemsTable.category)
    .orderBy(desc(sql`count(*)`), asc(inventoryItemsTable.category));

  res.json(
    GetInventorySummaryResponse.parse({
      totalItems: Number(totals?.totalItems ?? 0),
      totalUnits: Number(totals?.totalUnits ?? 0),
      categories: categories.map((category) => ({
        name: category.name,
        itemCount: Number(category.itemCount),
        unitCount: Number(category.unitCount),
      })),
    }),
  );
});

router.get("/inventory/items/:id", async (req, res): Promise<void> => {
  const params = GetInventoryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db
    .select()
    .from(inventoryItemsTable)
    .where(eq(inventoryItemsTable.id, params.data.id));
  if (!item) {
    res.status(404).json({ error: "Inventory item not found" });
    return;
  }
  res.json(GetInventoryItemResponse.parse(item));
});

router.patch("/inventory/items/:id", async (req, res): Promise<void> => {
  const params = UpdateInventoryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .update(inventoryItemsTable)
    .set({
      ...parsed.data,
      subcategory: parsed.data.subcategory ?? null,
      description: parsed.data.description ?? null,
      manufacturer: parsed.data.manufacturer ?? null,
      length: parsed.data.length ?? null,
      width: parsed.data.width ?? null,
      height: parsed.data.height ?? null,
      diameter: parsed.data.diameter ?? null,
      headWidth: parsed.data.headWidth ?? null,
      unit: parsed.data.unit ?? "mm",
      imageUrl: parsed.data.imageUrl ?? null,
    })
    .where(eq(inventoryItemsTable.id, params.data.id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Inventory item not found" });
    return;
  }
  res.json(UpdateInventoryItemResponse.parse(item));
});

router.delete("/inventory/items/:id", async (req, res): Promise<void> => {
  const params = DeleteInventoryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db
    .delete(inventoryItemsTable)
    .where(eq(inventoryItemsTable.id, params.data.id))
    .returning({ id: inventoryItemsTable.id });
  if (!item) {
    res.status(404).json({ error: "Inventory item not found" });
    return;
  }
  res.sendStatus(204);
});

router.get(
  "/inventory/items/:id/similar",
  async (req, res): Promise<void> => {
    const params = GetSimilarInventoryItemsParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [source] = await db
      .select()
      .from(inventoryItemsTable)
      .where(eq(inventoryItemsTable.id, params.data.id));
    if (!source) {
      res.status(404).json({ error: "Inventory item not found" });
      return;
    }

    const candidates = await db
      .select()
      .from(inventoryItemsTable)
      .where(
        and(
          sql`${inventoryItemsTable.id} <> ${source.id}`,
          or(
            eq(inventoryItemsTable.category, source.category),
            source.subcategory
              ? eq(inventoryItemsTable.subcategory, source.subcategory)
              : undefined,
          ),
        ),
      )
      .orderBy(asc(inventoryItemsTable.name))
      .limit(3);

    const similar = candidates.map((item) => {
      let score = item.category === source.category ? 0.72 : 0.58;
      if (source.subcategory && item.subcategory === source.subcategory) {
        score += 0.15;
      }
      if (
        source.diameter != null &&
        item.diameter != null &&
        source.diameter === item.diameter
      ) {
        score += 0.08;
      }
      return { ...item, similarityScore: Math.min(score, 0.98) };
    });

    res.json(GetSimilarInventoryItemsResponse.parse(similar));
  },
);

export default router;
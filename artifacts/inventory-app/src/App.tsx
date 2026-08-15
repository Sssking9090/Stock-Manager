import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  ChevronDown,
  LayoutGrid,
  MapPin,
  PackagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Ruler,
  Search,
  Tags,
  Trash2,
  Warehouse,
  X,
} from 'lucide-react';
import {
  getGetInventoryItemQueryKey,
  getGetInventorySummaryQueryKey,
  getListInventoryCategoriesQueryKey,
  getListInventoryItemsQueryKey,
  useCreateInventoryCategory,
  useCreateInventoryItem,
  useDeleteInventoryCategory,
  useDeleteInventoryItem,
  useGetInventoryItem,
  useGetInventorySummary,
  useGetSimilarInventoryItems,
  useListInventoryCategories,
  useListInventoryItems,
  useUpdateInventoryItem,
  type InventoryItem,
  type InventoryCategory,
  type InventoryItemInput,
} from '@workspace/api-client-react';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import './index.css';

const queryClient = new QueryClient();

const categoryColors = ['copper', 'sage', 'ochre', 'plum', 'slate'];
const categoryColor = (index: number) => categoryColors[index % categoryColors.length];
const initials = (value: string) => value.split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase();
const formatDate = (value: string) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));

function LogoMark() {
  return <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-sm" data-testid="logo-mark"><Box size={19} strokeWidth={2.4} /></div>;
}

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const isWorkspace = location === '/';
  const isCategories = location === '/categories';
  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[245px] flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] md:flex">
        <div className="flex items-center gap-3 px-6 pb-8 pt-7">
          <LogoMark />
          <div>
            <div className="text-[15px] font-semibold tracking-[-0.02em]">Benchstock</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[hsl(var(--sidebar-foreground)/.53)]">Workshop inventory</div>
          </div>
        </div>
        <nav className="px-3" aria-label="Primary navigation">
          <div className="mb-3 px-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(var(--sidebar-foreground)/.42)]">Workspace</div>
          <Link href="/" className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${isWorkspace ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.66)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-inventory">
            <LayoutGrid size={17} /><span>Inventory</span>{isWorkspace && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />}
          </Link>
           <Link href="/categories" className={`group mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${isCategories ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.66)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-categories">
             <Tags size={17} /><span>Categories</span>{isCategories && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />}
           </Link>
        </nav>
        <div className="mt-auto border-t border-[hsl(var(--sidebar-border))] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[hsl(var(--sidebar-accent))] font-mono text-[10px] text-[hsl(var(--accent))]" data-testid="avatar-workshop">WS</div>
            <div><div className="text-xs font-medium">Workshop desk</div><div className="font-mono text-[9px] text-[hsl(var(--sidebar-foreground)/.45)]">Local workspace</div></div>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-10 flex h-[66px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.93)] px-5 backdrop-blur md:ml-[245px] md:px-9">
        <Link href="/" className="flex items-center gap-2 md:hidden" data-testid="link-mobile-logo"><LogoMark /><span className="text-sm font-semibold">Benchstock</span></Link>
         <div className="hidden items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] md:flex"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />Workshop / <span className="text-[hsl(var(--foreground))]">{isWorkspace ? 'Inventory' : isCategories ? 'Categories' : 'Item record'}</span></div>
        <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--muted-foreground))]"><span className="hidden sm:inline">Stockroom sync</span><span className="h-1.5 w-1.5 rounded-full bg-[hsl(143_28%_44%)]" /><span className="font-mono text-[10px]">LIVE</span></div>
      </header>
      <main className="md:ml-[245px]">{children}</main>
    </div>
  );
}

function SkeletonRows() {
  return <div className="space-y-2" aria-label="Loading inventory">
    {[1, 2, 3, 4, 5].map((row) => <div key={row} className="flex h-[75px] animate-pulse items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.6)] px-4"><div className="h-11 w-11 rounded-lg bg-[hsl(var(--muted))]" /><div className="flex-1 space-y-2"><div className="h-3 w-1/3 rounded bg-[hsl(var(--muted))]" /><div className="h-2 w-1/5 rounded bg-[hsl(var(--muted))]" /></div><div className="h-5 w-16 rounded bg-[hsl(var(--muted))]" /></div>)}
  </div>;
}

function ItemThumb({ item, large = false }: { item: InventoryItem; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  return item.imageUrl && !failed ? <img src={item.imageUrl} alt={item.name} onError={() => setFailed(true)} className={`object-cover ${large ? 'h-full w-full' : 'h-full w-full'}`} data-testid={`img-item-${item.id}`} /> :
    <div className={`grid h-full w-full place-items-center bg-[linear-gradient(135deg,hsl(var(--muted)),hsl(var(--card)))] text-[hsl(var(--muted-foreground))] ${large ? '' : ''}`} data-testid={`img-fallback-${item.id}`}><span className={large ? 'text-4xl font-semibold tracking-[-.08em]' : 'text-sm font-semibold'}>{initials(item.name)}</span></div>;
}

function HomePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const filters = useMemo(() => ({ search: search.trim() || undefined, category: category || undefined, subcategory: subcategory || undefined }), [search, category, subcategory]);
  const itemsQuery = useListInventoryItems(filters);
  const summaryQuery = useGetInventorySummary();
  const categoriesQuery = useListInventoryCategories();
  const items = itemsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const refresh = () => { void queryClient.invalidateQueries({ queryKey: getListInventoryItemsQueryKey() }); void queryClient.invalidateQueries({ queryKey: getGetInventorySummaryQueryKey() }); void queryClient.invalidateQueries({ queryKey: getListInventoryCategoriesQueryKey() }); toast({ title: 'Inventory refreshed', description: 'The latest stockroom records are now in view.' }); };

  return <div className="mx-auto max-w-[1370px] px-5 pb-12 pt-8 md:px-9 md:pt-10">
    <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div className="animate-rise-in"><div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--accent))]"><Warehouse size={13} /> Stockroom index</div><h1 className="text-[clamp(2rem,4vw,3.3rem)] font-semibold leading-[.95] tracking-[-.06em]">Know what’s<br /><span className="text-[hsl(var(--muted-foreground))]">on the bench.</span></h1><p className="mt-4 max-w-[480px] text-sm leading-6 text-[hsl(var(--muted-foreground))]">A working inventory for parts that have a real home. Find the right piece, then put it back where it belongs.</p></div>
      <Link href="/items/new" className="group inline-flex h-11 items-center justify-center gap-2 self-start rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-medium text-[hsl(var(--primary-foreground))] shadow-sm hover:bg-[hsl(var(--primary)/.88)] lg:self-auto" data-testid="link-add-item"><Plus size={17} /> Add item <ArrowRight size={15} className="ml-1 transition-transform group-hover:translate-x-0.5" /></Link>
    </div>

    <section className="mb-8 grid gap-3 sm:grid-cols-3" aria-label="Inventory summary">
      <SummaryCard label="Tracked items" value={summaryQuery.isLoading ? '—' : String(summaryQuery.data?.totalItems ?? 0)} detail="distinct part records" icon={<Box size={17} />} accent="copper" />
      <SummaryCard label="Units on hand" value={summaryQuery.isLoading ? '—' : String(summaryQuery.data?.totalUnits ?? 0)} detail="across every location" icon={<PackagePlus size={17} />} accent="sage" />
      <SummaryCard label="Categories" value={summaryQuery.isLoading ? '—' : String(categories.length)} detail="organized groups" icon={<LayoutGrid size={17} />} accent="ochre" />
    </section>

    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_250px]">
      <section className="min-w-0">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, part number, location…" className="h-11 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card)/.7)] pl-10 pr-10 text-sm outline-none placeholder:text-[hsl(var(--muted-foreground)/.72)] focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent)/.15)]" data-testid="input-search-inventory" />{search && <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]" data-testid="button-clear-search"><X size={15} /></button>}</label>
          <button type="button" onClick={refresh} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] px-3.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]" data-testid="button-refresh-inventory"><RefreshCw size={15} /> Refresh</button>
        </div>
        <div className="mb-5 flex items-center justify-between"><div className="font-mono text-[10px] uppercase tracking-[.17em] text-[hsl(var(--muted-foreground))]">{itemsQuery.isLoading ? 'Reading stockroom…' : `${items.length} ${items.length === 1 ? 'record' : 'records'}`}</div>{(category || subcategory) && <button type="button" onClick={() => { setCategory(''); setSubcategory(''); }} className="text-xs font-medium text-[hsl(var(--accent))] hover:underline" data-testid="button-clear-filters">Clear filters</button>}</div>
        {itemsQuery.isLoading ? <SkeletonRows /> : itemsQuery.isError ? <ErrorState onRetry={() => void itemsQuery.refetch()} /> : items.length === 0 ? <EmptyState hasFilters={Boolean(search || category || subcategory)} onClear={() => { setSearch(''); setCategory(''); setSubcategory(''); }} /> : <div className="space-y-2">{items.map((item, index) => <InventoryRow item={item} key={item.id} index={index} />)}</div>}
      </section>
       <aside className="h-fit rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.72)] p-4 xl:mt-[55px]">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold">Browse by category</h2><ChevronDown size={15} className="text-[hsl(var(--muted-foreground))]" /></div>
         <div className="space-y-1.5">{categoriesQuery.isLoading ? [1, 2, 3].map((row) => <div key={row} className="h-9 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />) : categories.map((entry, index) => <button type="button" key={entry.id} onClick={() => setCategory(category === entry.name ? '' : entry.name)} className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-xs ${category === entry.name ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'}`} data-testid={`button-category-${entry.name}`}><span className={`h-2 w-2 rounded-full bg-[hsl(var(--${categoryColor(index)}))]`} /><span className="flex-1">{entry.name}</span><span className="font-mono text-[10px] opacity-70">{entry.itemCount}</span></button>)}</div>
         <div className="mt-5 border-t border-[hsl(var(--border))] pt-4"><label className="mb-2 block font-mono text-[9px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Subcategory</label><input value={subcategory} onChange={(event) => setSubcategory(event.target.value)} placeholder="e.g. fasteners" className="h-9 w-full rounded-md border border-[hsl(var(--input))] bg-transparent px-2.5 text-xs outline-none focus:border-[hsl(var(--accent))]" data-testid="input-subcategory-filter" /><Link href="/categories" className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-[hsl(var(--accent))] hover:underline" data-testid="link-manage-categories"><Tags size={12} /> Manage categories</Link></div>
      </aside>
    </div>
  </div>;
}

function SummaryCard({ label, value, detail, icon, accent }: { label: string; value: string; detail: string; icon: ReactNode; accent: string }) {
  return <div className="animate-rise-in rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.72)] p-4 shadow-[0_2px_10px_hsl(var(--foreground)/.025)]"><div className={`mb-5 grid h-8 w-8 place-items-center rounded-lg bg-[hsl(var(--${accent})/.15)] text-[hsl(var(--${accent}))]`}>{icon}</div><div className="flex items-end justify-between gap-2"><div><div className="font-mono text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">{label}</div><div className="mt-1 text-2xl font-semibold tracking-[-.04em]" data-testid={`text-summary-${label.toLowerCase().replace(' ', '-')}`}>{value}</div></div><div className="pb-1 text-right text-[10px] text-[hsl(var(--muted-foreground))]">{detail}</div></div></div>;
}

function InventoryRow({ item, index }: { item: InventoryItem; index: number }) {
  return <Link href={`/items/${item.id}`} className={`group animate-rise-in delay-${Math.min(index + 1, 3)} flex min-h-[76px] items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.7)] p-3 hover:-translate-y-0.5 hover:border-[hsl(var(--accent)/.48)] hover:bg-[hsl(var(--card))] sm:gap-4 sm:p-3.5`} data-testid={`row-item-${item.id}`}>
    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[hsl(var(--border))]"><ItemThumb item={item} /></div>
    <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{item.name}</div><div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] text-[hsl(var(--muted-foreground))]"><span>{item.partNumber}</span><span className="text-[hsl(var(--border))]">/</span><span>{item.category}</span></div></div>
    <div className="hidden items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] sm:flex"><MapPin size={13} /><span>{item.location}</span></div>
    <div className="w-[62px] shrink-0 text-right"><div className="font-mono text-sm font-medium text-[hsl(var(--foreground))]">{item.quantity}</div><div className="font-mono text-[9px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">units</div></div><ArrowRight size={15} className="shrink-0 text-[hsl(var(--muted-foreground)/.55)] transition-transform group-hover:translate-x-0.5 group-hover:text-[hsl(var(--accent))]" />
  </Link>;
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="rounded-xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.06)] px-6 py-12 text-center" data-testid="status-inventory-error"><div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-[hsl(var(--destructive)/.12)] text-[hsl(var(--destructive))]"><X size={18} /></div><h3 className="text-sm font-semibold">Couldn’t read the stockroom</h3><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[hsl(var(--muted-foreground))]">The inventory service didn’t respond. Check the connection and try again.</p><button type="button" onClick={onRetry} className="mt-5 rounded-md bg-[hsl(var(--primary))] px-3.5 py-2 text-xs font-medium text-[hsl(var(--primary-foreground))]" data-testid="button-retry-inventory">Try again</button></div>;
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/.5)] px-6 py-16 text-center" data-testid="status-inventory-empty"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"><Search size={20} /></div><h3 className="text-sm font-semibold">{hasFilters ? 'No parts match that search' : 'The stockroom is ready for its first part'}</h3><p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[hsl(var(--muted-foreground))]">{hasFilters ? 'Try another name, category, or location.' : 'Add a record when a new piece finds its home.'}</p>{hasFilters && <button type="button" onClick={onClear} className="mt-4 text-xs font-medium text-[hsl(var(--accent))] hover:underline" data-testid="button-empty-clear">Clear search</button>}</div>;
}

type CategoryFormValues = { name: string };

function CategoriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const categoriesQuery = useListInventoryCategories();
  const createMutation = useCreateInventoryCategory();
  const deleteMutation = useDeleteInventoryCategory();
  const form = useForm<CategoryFormValues>({ defaultValues: { name: '' } });
  const categories = categoriesQuery.data ?? [];

  const onSubmit = (values: CategoryFormValues) => {
    const name = values.name.trim();
    if (!name) return;
    createMutation.mutate(
      { data: { name } },
      {
        onSuccess: () => {
          form.reset();
          void queryClient.invalidateQueries({ queryKey: getListInventoryCategoriesQueryKey() });
          void queryClient.invalidateQueries({ queryKey: getGetInventorySummaryQueryKey() });
          toast({ title: 'Category added', description: `${name} is ready for new inventory items.` });
        },
        onError: () => toast({ title: 'Couldn’t add category', description: 'A category with that name may already exist.', variant: 'destructive' }),
      },
    );
  };

  const removeCategory = (category: InventoryCategory) => {
    if (category.itemCount > 0) {
      toast({ title: 'Move items first', description: `${category.name} still contains ${category.itemCount} ${category.itemCount === 1 ? 'item' : 'items'}.`, variant: 'destructive' });
      return;
    }
    deleteMutation.mutate(
      { id: category.id },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: getListInventoryCategoriesQueryKey() });
          void queryClient.invalidateQueries({ queryKey: getGetInventorySummaryQueryKey() });
          toast({ title: 'Category removed', description: `${category.name} was removed.` });
        },
        onError: () => toast({ title: 'Couldn’t remove category', description: 'Move or remove its items before trying again.', variant: 'destructive' }),
      },
    );
  };

  return <div className="mx-auto max-w-[980px] px-5 pb-16 pt-8 md:px-9 md:pt-10">
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div className="animate-rise-in"><div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--accent))]"><Tags size={13} /> Organization</div><h1 className="text-[clamp(2rem,4vw,3.3rem)] font-semibold leading-[.95] tracking-[-.06em]">Shape your<br /><span className="text-[hsl(var(--muted-foreground))]">stockroom.</span></h1><p className="mt-4 max-w-[480px] text-sm leading-6 text-[hsl(var(--muted-foreground))]">Create the groups that match how your parts are stored. Items can be assigned to any saved category when you add or edit them.</p></div>
      <Link href="/" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] px-3.5 text-xs font-medium hover:bg-[hsl(var(--muted))]" data-testid="link-back-inventory"><ArrowLeft size={15} /> Back to inventory</Link>
    </div>

    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="mb-8 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.72)] p-5 md:p-6" data-testid="form-create-category">
      <div className="mb-4 flex items-baseline justify-between gap-3"><div><h2 className="text-sm font-semibold">Add a category</h2><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Keep names short and easy to recognize on the shelf.</p></div><Plus size={17} className="text-[hsl(var(--accent))]" /></div>
      <div className="flex flex-col gap-3 sm:flex-row"><input {...form.register('name', { required: 'Category name is required' })} placeholder="e.g. Safety equipment" className="field flex-1" data-testid="input-category-name" /><button type="submit" disabled={createMutation.isPending} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-medium text-[hsl(var(--primary-foreground))] disabled:cursor-wait disabled:opacity-60" data-testid="button-add-category">{createMutation.isPending ? <RefreshCw size={15} className="animate-spin" /> : <Plus size={16} />}{createMutation.isPending ? 'Adding…' : 'Add category'}</button></div>
      {form.formState.errors.name && <p className="mt-2 text-[10px] text-[hsl(var(--destructive))]">{form.formState.errors.name.message}</p>}
    </form></Form>

    <section aria-label="Saved categories">
      <div className="mb-4 flex items-center justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.17em] text-[hsl(var(--muted-foreground))]">Saved groups</div><h2 className="mt-1 text-xl font-semibold tracking-[-.035em]">{categories.length} {categories.length === 1 ? 'category' : 'categories'}</h2></div></div>
      {categoriesQuery.isLoading ? <div className="space-y-2">{[1, 2, 3].map((row) => <div key={row} className="h-[70px] animate-pulse rounded-xl bg-[hsl(var(--muted))]" />)}</div> : categoriesQuery.isError ? <ErrorState onRetry={() => void categoriesQuery.refetch()} /> : categories.length === 0 ? <div className="rounded-xl border border-dashed border-[hsl(var(--border))] px-6 py-14 text-center text-sm text-[hsl(var(--muted-foreground))]">No categories yet. Add one above to start organizing items.</div> : <div className="space-y-2">{categories.map((category, index) => <div key={category.id} className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.7)] p-3.5" data-testid={`row-category-${category.id}`}><div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[hsl(var(--${categoryColor(index)})/.14)] text-[hsl(var(--${categoryColor(index)}))]`}><Tags size={17} /></div><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{category.name}</div><div className="mt-1 font-mono text-[10px] text-[hsl(var(--muted-foreground))]">{category.itemCount} {category.itemCount === 1 ? 'item' : 'items'} · {category.unitCount} units</div></div><button type="button" onClick={() => removeCategory(category)} disabled={deleteMutation.isPending || category.itemCount > 0} title={category.itemCount > 0 ? 'Move or remove items before deleting this category' : 'Remove category'} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[hsl(var(--destructive)/.28)] px-2.5 text-xs font-medium text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/.08)] disabled:cursor-not-allowed disabled:opacity-35" data-testid={`button-delete-category-${category.id}`}><Trash2 size={14} /> Remove</button></div>)}</div>}
    </section>
  </div>;
}

function ItemDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const id = Number(params.id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const itemQuery = useGetInventoryItem(id, { query: { enabled: id > 0, queryKey: getGetInventoryItemQueryKey(id) } });
  const similarQuery = useGetSimilarInventoryItems(id, { query: { enabled: id > 0, queryKey: ['/api/inventory/items', id, 'similar'] } });
  const deleteMutation = useDeleteInventoryItem();
  const item = itemQuery.data;
  const handleDelete = () => {
    if (!item) return;
    deleteMutation.mutate({ id: item.id }, { onSuccess: () => { void queryClient.invalidateQueries({ queryKey: getListInventoryItemsQueryKey() }); void queryClient.invalidateQueries({ queryKey: getGetInventorySummaryQueryKey() }); toast({ title: 'Item deleted', description: `${item.name} was removed from inventory.` }); setLocation('/'); }, onError: () => toast({ title: 'Couldn’t delete item', description: 'The record is still in your inventory.', variant: 'destructive' }) });
  };
  if (itemQuery.isLoading) return <PageLoading />;
  if (itemQuery.isError || !item) return <div className="mx-auto max-w-3xl px-5 py-20 md:px-9"><ErrorState onRetry={() => void itemQuery.refetch()} /></div>;
  return <div className="mx-auto max-w-[1180px] px-5 pb-12 pt-7 md:px-9 md:pt-9">
    <Link href="/" className="mb-7 inline-flex items-center gap-2 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--accent))]" data-testid="link-back-inventory"><ArrowLeft size={15} /> Back to inventory</Link>
    <div className="mb-8 flex flex-col justify-between gap-5 border-b border-[hsl(var(--border))] pb-8 sm:flex-row sm:items-end"><div><div className="mb-2 font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--accent))]">Part record · {item.partNumber}</div><h1 className="max-w-2xl text-3xl font-semibold tracking-[-.055em] md:text-5xl" data-testid="text-item-name">{item.name}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.description || 'No description has been added to this record.'}</p></div><div className="flex gap-2"><Link href={`/items/${item.id}/edit`} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[hsl(var(--border))] px-3.5 text-xs font-medium hover:bg-[hsl(var(--muted))]" data-testid="link-edit-item"><Pencil size={14} /> Edit</Link><button type="button" onClick={() => setConfirmDelete(true)} disabled={deleteMutation.isPending} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[hsl(var(--destructive)/.3)] px-3.5 text-xs font-medium text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/.08)] disabled:opacity-50" data-testid="button-delete-item"><Trash2 size={14} /> {deleteMutation.isPending ? 'Deleting…' : 'Delete'}</button></div></div>
    <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div><div className="aspect-square overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"><ItemThumb item={item} large /></div><div className="mt-3 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]"><MapPin size={14} className="text-[hsl(var(--accent))]" /><span>Stored at</span><strong className="font-mono font-medium text-[hsl(var(--foreground))]">{item.location}</strong></div></div>
     <div><div className="grid gap-3 sm:grid-cols-3"><DetailStat label="Quantity" value={`${item.quantity} units`} accent="copper" /><DetailStat label="Category" value={item.category} accent="sage" /><DetailStat label="Manufacturer" value={item.manufacturer || 'Not set'} accent="ochre" /></div><DimensionPanel item={item} /><div className="mt-8 border-t border-[hsl(var(--border))] pt-5"><div className="flex items-center justify-between text-[10px] text-[hsl(var(--muted-foreground))]"><span>Record created {formatDate(item.createdAt)}</span><span>Updated {formatDate(item.updatedAt)}</span></div></div></div>
    </div>
    <section className="mt-12 border-t border-[hsl(var(--border))] pt-7"><div className="mb-4 flex items-end justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.17em] text-[hsl(var(--accent))]">Nearby in the system</div><h2 className="mt-1 text-xl font-semibold tracking-[-.035em]">Similar items</h2></div><span className="text-xs text-[hsl(var(--muted-foreground))]">Based on category and dimensions</span></div>{similarQuery.isLoading ? <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((entry) => <div key={entry} className="h-20 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />)}</div> : similarQuery.isError ? <p className="text-xs text-[hsl(var(--muted-foreground))]">Similar parts are temporarily unavailable.</p> : (similarQuery.data?.length ?? 0) === 0 ? <p className="rounded-xl border border-dashed border-[hsl(var(--border))] px-5 py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">No similar parts have been catalogued yet.</p> : <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{similarQuery.data?.map((similar) => <Link href={`/items/${similar.id}`} key={similar.id} className="group flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.65)] p-3 hover:border-[hsl(var(--accent)/.48)]" data-testid={`link-similar-${similar.id}`}><div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[hsl(var(--border))]"><ItemThumb item={similar} /></div><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold">{similar.name}</div><div className="mt-1 font-mono text-[9px] text-[hsl(var(--muted-foreground))]">{Math.round(similar.similarityScore * 100)}% match</div></div><ArrowRight size={14} className="text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--accent))]" /></Link>)}</div>}</section>
    {confirmDelete && <div className="fixed inset-0 z-50 grid place-items-center bg-[hsl(var(--foreground)/.32)] p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title" data-testid="dialog-confirm-delete"><div className="w-full max-w-[390px] rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl"><div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--destructive)/.1)] text-[hsl(var(--destructive))]"><Trash2 size={18} /></div><h2 id="delete-dialog-title" className="text-lg font-semibold tracking-[-.03em]">Remove this part?</h2><p className="mt-2 text-sm leading-5 text-[hsl(var(--muted-foreground))]"><strong className="font-medium text-[hsl(var(--foreground))]">{item.name}</strong> will be removed from the stockroom record. This cannot be undone.</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setConfirmDelete(false)} className="h-10 rounded-lg border border-[hsl(var(--border))] px-4 text-xs font-medium hover:bg-[hsl(var(--muted))]" data-testid="button-cancel-delete">Keep item</button><button type="button" onClick={() => { setConfirmDelete(false); handleDelete(); }} disabled={deleteMutation.isPending} className="h-10 rounded-lg bg-[hsl(var(--destructive))] px-4 text-xs font-medium text-[hsl(var(--destructive-foreground))] disabled:opacity-60" data-testid="button-confirm-delete">Remove part</button></div></div></div>}
  </div>;
}

function DetailStat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.62)] p-4"><div className={`mb-4 h-1 w-7 rounded-full bg-[hsl(var(--${accent}))]`} /><div className="font-mono text-[9px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">{label}</div><div className="mt-1 truncate text-sm font-semibold" data-testid={`text-detail-${label.toLowerCase()}`}>{value}</div></div>;
}

function DimensionPanel({ item }: { item: InventoryItem }) {
  const dimensions = [['Length', item.length], ['Width', item.width], ['Height', item.height], ['Diameter', item.diameter], ['Head width', item.headWidth]].filter((entry): entry is [string, number] => entry[1] !== null && entry[1] !== undefined);
  return <div className="mt-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.62)] p-5"><div className="mb-4 flex items-center gap-2"><Ruler size={15} className="text-[hsl(var(--accent))]" /><h2 className="text-sm font-semibold">Dimensions</h2><span className="ml-auto font-mono text-[9px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">mm</span></div>{dimensions.length ? <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">{dimensions.map(([label, value]) => <div key={label} className="flex items-baseline justify-between gap-2 border-b border-[hsl(var(--border)/.7)] pb-2 text-xs"><span className="text-[hsl(var(--muted-foreground))]">{label}</span><span className="font-mono font-medium" data-testid={`text-dimension-${label.toLowerCase().replace(' ', '-')}`}>{value}</span></div>)}</div> : <p className="text-xs text-[hsl(var(--muted-foreground))]">No dimensions recorded for this part.</p>}</div>;
}

type FormValues = { name: string; partNumber: string; category: string; subcategory: string; description: string; manufacturer: string; length: string; width: string; height: string; diameter: string; headWidth: string; unit: string; quantity: string; location: string; imageUrl: string };
const blankValues: FormValues = { name: '', partNumber: '', category: '', subcategory: '', description: '', manufacturer: '', length: '', width: '', height: '', diameter: '', headWidth: '', unit: 'mm', quantity: '0', location: '', imageUrl: '' };
const toFormValues = (item: InventoryItem): FormValues => ({ name: item.name, partNumber: item.partNumber, category: item.category, subcategory: item.subcategory || '', description: item.description || '', manufacturer: item.manufacturer || '', length: item.length?.toString() || '', width: item.width?.toString() || '', height: item.height?.toString() || '', diameter: item.diameter?.toString() || '', headWidth: item.headWidth?.toString() || '', unit: item.unit, quantity: item.quantity.toString(), location: item.location, imageUrl: item.imageUrl || '' });
const optionalNumber = (value: string) => value.trim() === '' ? null : Number(value);
const buildPayload = (values: FormValues): InventoryItemInput => ({ name: values.name.trim(), partNumber: values.partNumber.trim(), category: values.category.trim(), subcategory: values.subcategory.trim() || null, description: values.description.trim() || null, manufacturer: values.manufacturer.trim() || null, length: optionalNumber(values.length), width: optionalNumber(values.width), height: optionalNumber(values.height), diameter: optionalNumber(values.diameter), headWidth: optionalNumber(values.headWidth), unit: values.unit.trim() || 'mm', quantity: Math.max(0, Number(values.quantity) || 0), location: values.location.trim(), imageUrl: values.imageUrl.trim() || null });

function ItemFormPage() {
  const params = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isNew = !params.id || params.id === 'new';
  const id = Number(params.id);
  const itemQuery = useGetInventoryItem(id, { query: { enabled: !isNew && id > 0, queryKey: getGetInventoryItemQueryKey(id) } });
  const categoriesQuery = useListInventoryCategories();
  const form = useForm<FormValues>({ defaultValues: blankValues });
  const createMutation = useCreateInventoryItem();
  const updateMutation = useUpdateInventoryItem();
  const saving = createMutation.isPending || updateMutation.isPending;
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!isNew && itemQuery.data && !initialized) {
      form.reset(toFormValues(itemQuery.data));
      setInitialized(true);
    }
  }, [form, initialized, isNew, itemQuery.data]);
  const onSubmit = (values: FormValues) => {
    const data = buildPayload(values);
    if (isNew) createMutation.mutate({ data }, { onSuccess: (created) => { void queryClient.invalidateQueries({ queryKey: getListInventoryItemsQueryKey() }); void queryClient.invalidateQueries({ queryKey: getGetInventorySummaryQueryKey() }); toast({ title: 'Item added', description: `${created.name} is now in the stockroom.` }); setLocation(`/items/${created.id}`); }, onError: () => toast({ title: 'Couldn’t add item', description: 'Check the required fields and try again.', variant: 'destructive' }) });
    else updateMutation.mutate({ id, data }, { onSuccess: (updated) => { queryClient.setQueryData(getGetInventoryItemQueryKey(id), updated); void queryClient.invalidateQueries({ queryKey: getListInventoryItemsQueryKey() }); void queryClient.invalidateQueries({ queryKey: getGetInventorySummaryQueryKey() }); toast({ title: 'Item updated', description: 'The stockroom record is up to date.' }); setLocation(`/items/${updated.id}`); }, onError: () => toast({ title: 'Couldn’t update item', description: 'The record was not changed.', variant: 'destructive' }) });
  };
  if (!isNew && itemQuery.isLoading) return <PageLoading />;
  if (!isNew && itemQuery.isError) return <div className="mx-auto max-w-3xl px-5 py-20 md:px-9"><ErrorState onRetry={() => void itemQuery.refetch()} /></div>;
  return <div className="mx-auto max-w-[960px] px-5 pb-16 pt-7 md:px-9 md:pt-9">
    <Link href={isNew ? '/' : `/items/${id}`} className="mb-7 inline-flex items-center gap-2 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--accent))]" data-testid="link-cancel-form"><ArrowLeft size={15} /> {isNew ? 'Back to inventory' : 'Back to item'}</Link>
    <div className="mb-8"><div className="mb-2 font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--accent))]">{isNew ? 'New record' : 'Edit record'}</div><h1 className="text-3xl font-semibold tracking-[-.055em]">{isNew ? 'Add a part to the stockroom' : 'Update this part'}</h1><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{isNew ? 'Give this piece a clear name and a reliable home.' : 'Keep the physical record and the digital one in agreement.'}</p></div>
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7" data-testid="form-inventory-item">
       <FormSection title="Part identity" note="The details people will search first"><div className="grid gap-4 md:grid-cols-2"><Field label="Name" required error={form.formState.errors.name?.message}><input {...form.register('name', { required: 'Name is required' })} placeholder="e.g. M4 socket head cap screw" className="field" data-testid="input-item-name" /></Field><Field label="Part number" required error={form.formState.errors.partNumber?.message}><input {...form.register('partNumber', { required: 'Part number is required' })} placeholder="e.g. FST-M4-016" className="field font-mono" data-testid="input-item-part-number" /></Field><Field label="Category" required error={form.formState.errors.category?.message}><select {...form.register('category', { required: 'Choose a category' })} className="field" data-testid="input-item-category" disabled={categoriesQuery.isLoading}><option value="">{categoriesQuery.isLoading ? 'Loading categories…' : 'Choose a category'}</option>{categoriesQuery.data?.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select>{!categoriesQuery.isLoading && categoriesQuery.data?.length === 0 && <Link href="/categories" className="mt-1 inline-flex text-[10px] font-medium text-[hsl(var(--accent))] hover:underline" data-testid="link-add-category-from-item">Add a category first</Link>}</Field><Field label="Subcategory"><input {...form.register('subcategory')} placeholder="e.g. Socket head" className="field" data-testid="input-item-subcategory" /></Field></div><Field label="Description"><textarea {...form.register('description')} rows={3} placeholder="A short note about this part, its use, or what makes it distinct." className="field min-h-[88px] resize-y py-2" data-testid="input-item-description" /></Field></FormSection>
       <FormSection title="Stock & location" note="The facts that keep a shelf honest"><div className="grid gap-4 sm:grid-cols-3"><Field label="Quantity" required><input type="number" min="0" {...form.register('quantity', { required: true })} className="field font-mono" data-testid="input-item-quantity" /></Field><Field label="Dimension unit"><input {...form.register('unit')} placeholder="mm" className="field font-mono" data-testid="input-item-unit" /></Field><Field label="Location" required><input {...form.register('location', { required: 'Location is required' })} placeholder="Bay B / Bin 04" className="field font-mono" data-testid="input-item-location" /></Field></div></FormSection>
      <FormSection title="Physical details" note="Optional measurements in millimetres"><div className="grid grid-cols-2 gap-4 sm:grid-cols-5"><Field label="Length"><input type="number" step="any" {...form.register('length')} placeholder="—" className="field font-mono" data-testid="input-item-length" /></Field><Field label="Width"><input type="number" step="any" {...form.register('width')} placeholder="—" className="field font-mono" data-testid="input-item-width" /></Field><Field label="Height"><input type="number" step="any" {...form.register('height')} placeholder="—" className="field font-mono" data-testid="input-item-height" /></Field><Field label="Diameter"><input type="number" step="any" {...form.register('diameter')} placeholder="—" className="field font-mono" data-testid="input-item-diameter" /></Field><Field label="Head width"><input type="number" step="any" {...form.register('headWidth')} placeholder="—" className="field font-mono" data-testid="input-item-head-width" /></Field></div></FormSection>
       <FormSection title="Source & reference" note="Useful context for the next person at the desk"><div className="grid gap-4 md:grid-cols-2"><Field label="Manufacturer"><input {...form.register('manufacturer')} placeholder="e.g. Würth" className="field" data-testid="input-item-manufacturer" /></Field><Field label="Image URL (optional)"><input type="url" {...form.register('imageUrl')} placeholder="https://…" className="field font-mono" data-testid="input-item-image-url" /></Field></div></FormSection>
      <div className="flex flex-col-reverse justify-end gap-3 border-t border-[hsl(var(--border))] pt-5 sm:flex-row"><Link href={isNew ? '/' : `/items/${id}`} className="inline-flex h-11 items-center justify-center rounded-lg border border-[hsl(var(--border))] px-5 text-sm font-medium hover:bg-[hsl(var(--muted))]" data-testid="button-cancel-form">Cancel</Link><button type="submit" disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-5 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/.88)] disabled:cursor-wait disabled:opacity-60" data-testid="button-submit-item">{saving ? <RefreshCw size={15} className="animate-spin" /> : <Check size={16} />}{saving ? 'Saving…' : isNew ? 'Add to inventory' : 'Save changes'}</button></div>
    </form></Form>
  </div>;
}

function FormSection({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.62)] p-5 md:p-6"><div className="mb-5 flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline"><h2 className="text-sm font-semibold">{title}</h2><span className="text-[11px] text-[hsl(var(--muted-foreground))]">{note}</span></div><div className="space-y-4">{children}</div></section>;
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">{label}{required && <span className="ml-1 text-[hsl(var(--accent))]">*</span>}</span>{children}{error && <span className="mt-1 block text-[10px] text-[hsl(var(--destructive))]">{error}</span>}</label>;
}

function PageLoading() {
  return <div className="mx-auto max-w-[1180px] animate-pulse px-5 py-12 md:px-9"><div className="h-3 w-24 rounded bg-[hsl(var(--muted))]" /><div className="mt-7 h-12 w-2/3 rounded bg-[hsl(var(--muted))]" /><div className="mt-3 h-4 w-1/2 rounded bg-[hsl(var(--muted))]" /><div className="mt-10 grid gap-4 md:grid-cols-3"><div className="h-44 rounded-xl bg-[hsl(var(--muted))]" /><div className="h-44 rounded-xl bg-[hsl(var(--muted))]" /><div className="h-44 rounded-xl bg-[hsl(var(--muted))]" /></div></div>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Shell><Switch><Route path="/" component={HomePage} /><Route path="/categories" component={CategoriesPage} /><Route path="/items/new" component={ItemFormPage} /><Route path="/items/:id/edit" component={ItemFormPage} /><Route path="/items/:id" component={ItemDetailPage} /><Route component={NotFound} /></Switch></Shell></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></QueryClientProvider>;
}

export default App;
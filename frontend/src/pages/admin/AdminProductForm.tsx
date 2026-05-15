import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  useCreateProductMutation,
  useGetAdminProductQuery,
  useUpdateProductMutation,
  type ProductPayload,
} from '@/features/admin/adminApi';

const CATEGORIES = ['laptops', 'tablets', 'smartphones', 'accessories', 'monitors'];

const emptyForm: ProductPayload = {
  name: '',
  category: 'laptops',
  brand: '',
  description: '',
  price: 0,
  original_price: null,
  currency: 'USD',
  stock: 0,
  image_url: '',
  is_active: true,
  is_featured: false,
};

export default function AdminProductForm() {
  const { id } = useParams();
  const numericId = id ? Number(id) : null;
  const isEdit = numericId !== null && Number.isFinite(numericId);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading: isLoadingExisting } = useGetAdminProductQuery(numericId as number, {
    skip: !isEdit,
  });
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

  const [form, setForm] = useState<ProductPayload>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && data?.data) {
      const p = data.data;
      setForm({
        name: p.name,
        sku: p.sku ?? '',
        category: p.category,
        brand: p.brand ?? '',
        description: p.description ?? '',
        price: p.price,
        original_price: p.original_price,
        currency: p.currency,
        stock: p.stock,
        image_url: p.image_url ?? '',
        is_active: p.is_active,
        is_featured: p.is_featured,
      });
    }
  }, [isEdit, data]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    const body: ProductPayload = {
      ...form,
      price: Number(form.price),
      stock: form.stock !== undefined ? Number(form.stock) : 0,
      original_price:
        form.original_price === null || form.original_price === undefined || (form.original_price as unknown as string) === ''
          ? null
          : Number(form.original_price),
      brand: form.brand || null,
      sku: form.sku || null,
      image_url: form.image_url || null,
      description: form.description || null,
    };

    try {
      const res = isEdit
        ? await updateProduct({ id: numericId as number, body }).unwrap()
        : await createProduct(body).unwrap();
      navigate(`/admin/products/${res.data.id}/edit`, { replace: true });
    } catch (err) {
      const e = err as { data?: { error?: { message?: string; details?: Record<string, string[]> } } };
      setErrors(e?.data?.error?.details ?? {});
      setGeneralError(e?.data?.error?.message ?? t('errors.generic'));
    }
  };

  if (isEdit && isLoadingExisting) return <p>{t('products.loading')}</p>;

  const submitting = creating || updating;

  return (
    <section>
      <Link to="/admin/products" className="btn btn-ghost" style={{ width: 'fit-content' }}>← {t('admin.back_to_products')}</Link>
      <h1>{isEdit ? t('admin.edit_product') : t('admin.new_product')}</h1>

      <form className="form admin-form" onSubmit={onSubmit} noValidate>
        <label>
          <span>{t('admin.field.name')}</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          {errors.name?.[0] && <small className="field-error">{errors.name[0]}</small>}
        </label>

        <div className="form-row">
          <label>
            <span>{t('admin.field.sku')}</span>
            <input value={form.sku ?? ''} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            {errors.sku?.[0] && <small className="field-error">{errors.sku[0]}</small>}
          </label>
          <label>
            <span>{t('admin.field.category')}</span>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <label>
          <span>{t('admin.field.brand')}</span>
          <input value={form.brand ?? ''} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        </label>

        <label>
          <span>{t('admin.field.description')}</span>
          <textarea
            rows={4}
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>

        <div className="form-row">
          <label>
            <span>{t('admin.field.price')}</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              required
            />
            {errors.price?.[0] && <small className="field-error">{errors.price[0]}</small>}
          </label>
          <label>
            <span>{t('admin.field.original_price')}</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.original_price ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  original_price: e.target.value === '' ? null : Number(e.target.value),
                })
              }
            />
            {errors.original_price?.[0] && <small className="field-error">{errors.original_price[0]}</small>}
          </label>
          <label>
            <span>{t('admin.field.currency')}</span>
            <input
              value={form.currency ?? 'USD'}
              onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
              maxLength={3}
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            <span>{t('admin.field.stock')}</span>
            <input
              type="number"
              min="0"
              value={form.stock ?? 0}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            />
            {errors.stock?.[0] && <small className="field-error">{errors.stock[0]}</small>}
          </label>
          <label>
            <span>{t('admin.field.image_url')}</span>
            <input
              value={form.image_url ?? ''}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://..."
            />
            {errors.image_url?.[0] && <small className="field-error">{errors.image_url[0]}</small>}
          </label>
        </div>

        <div className="form-row" style={{ alignItems: 'center' }}>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={!!form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            <span>{t('admin.field.is_active')}</span>
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={!!form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
            />
            <span>{t('admin.field.is_featured')}</span>
          </label>
        </div>

        {generalError && <p className="field-error">{generalError}</p>}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn btn-accent" disabled={submitting}>
            {submitting ? t('admin.saving') : t('admin.save')}
          </button>
          <Link to="/admin/products" className="btn btn-ghost">{t('admin.cancel')}</Link>
        </div>
      </form>
    </section>
  );
}

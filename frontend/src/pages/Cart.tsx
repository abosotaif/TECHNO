import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { removeFromCart, setQuantity, clearCart } from '@/features/cart/cartSlice';
import { selectCartItems, selectCartTotals } from '@/features/cart/selectors';
import { useDocumentMeta } from '@/lib/useDocumentMeta';

export default function Cart() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const items = useAppSelector(selectCartItems);
  const totals = useAppSelector(selectCartTotals);
  const isAuthed = useAppSelector((s) => Boolean(s.auth.token));

  useDocumentMeta({
    title: t('cart.title'),
    robots: 'noindex,nofollow',
  });

  if (items.length === 0) {
    return (
      <section style={{ textAlign: 'center', padding: '2rem 0' }}>
        <h1>{t('cart.title')}</h1>
        <p className="meta">{t('cart.empty')}</p>
        <Link to="/products" className="btn">{t('cart.go_shopping')}</Link>
      </section>
    );
  }

  const goCheckout = () => {
    if (!isAuthed) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  return (
    <section>
      <h1>{t('cart.title')}</h1>

      <ul className="cart-list">
        {items.map((i) => (
          <li key={i.productId} className="cart-row">
            <div
              className="cart-thumb"
              style={{ backgroundImage: i.imageUrl ? `url(${i.imageUrl})` : undefined }}
              aria-hidden
            />
            <div className="cart-info">
              <Link to={`/products/${i.slug}`}><strong>{i.name}</strong></Link>
              <span className="meta">{i.price.toFixed(2)} {i.currency}</span>
            </div>
            <div className="cart-qty">
              <button
                type="button"
                aria-label="-"
                onClick={() =>
                  dispatch(setQuantity({ productId: i.productId, quantity: i.quantity - 1 }))
                }
              >−</button>
              <input
                type="number"
                min={1}
                max={i.stock}
                value={i.quantity}
                onChange={(e) =>
                  dispatch(setQuantity({
                    productId: i.productId,
                    quantity: Number(e.target.value) || 1,
                  }))
                }
                aria-label="quantity"
              />
              <button
                type="button"
                aria-label="+"
                onClick={() =>
                  dispatch(setQuantity({ productId: i.productId, quantity: i.quantity + 1 }))
                }
              >+</button>
            </div>
            <div className="cart-line">
              <strong>{(i.price * i.quantity).toFixed(2)} {i.currency}</strong>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => dispatch(removeFromCart(i.productId))}
              >
                {t('cart.remove')}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <aside className="cart-summary">
        <div><span>{t('cart.subtotal')}</span><span>{totals.subtotal.toFixed(2)} {totals.currency}</span></div>
        <div>
          <span>{t('cart.shipping')}</span>
          <span>{totals.shipping === 0 ? t('cart.free') : `${totals.shipping.toFixed(2)} ${totals.currency}`}</span>
        </div>
        <div className="cart-total">
          <strong>{t('cart.total')}</strong>
          <strong>{totals.total.toFixed(2)} {totals.currency}</strong>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-accent" onClick={goCheckout}>
            {t('cart.checkout')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => dispatch(clearCart())}>
            {t('cart.clear')}
          </button>
        </div>
      </aside>
    </section>
  );
}

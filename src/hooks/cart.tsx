import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity?: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (productsStorage) {
        setProducts(JSON.parse(productsStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productExistsCart = products.find(
        productExistsInCart => productExistsInCart.id === product.id,
      );

      if (productExistsCart?.id) {
        productExistsCart.quantity ? productExistsCart.quantity + 1 : 1;

        const productsInCart = products.filter(
          productInCart => productInCart.id !== productExistsCart.id,
        );

        const newProductsInCart = [productExistsCart, ...productsInCart];
        setProducts(newProductsInCart);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProductsInCart),
        );
      } else {
        const newProductItem = product;
        newProductItem.quantity = 1;

        const newProductsInCart = [newProductItem, ...products];
        setProducts(newProductsInCart);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProductsInCart),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productInCart =
        products.find(product => product.id === id) || ({} as Product);

      productInCart.quantity = productInCart.quantity
        ? productInCart.quantity + 1
        : 1;

      const productsCart = products.filter(product => product.id !== id);
      setProducts([productInCart, ...productsCart]);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify([productInCart, ...productsCart]),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsCart = products.filter(product => product.id !== id);
      const productInCart =
        products.find(product => product.id === id) || ({} as Product);

      productInCart.quantity = productInCart.quantity
        ? productInCart.quantity - 1
        : 0;

      if (productInCart.quantity === 0) {
        setProducts(productsCart);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(productsCart),
        );
      } else {
        const newProductsInCart = [productInCart, ...productsCart];
        setProducts(newProductsInCart);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProductsInCart),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };

"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ProductDetails({
  params,
}: {
  params: { id: string };
}) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", params.id);

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({
            id: docSnap.id,
            ...docSnap.data(),
          });
        }
      } catch (error) {
        console.log(error);
      }

      setLoading(false);
    };

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-8">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8">
        Product not found.
      </div>
    );
  }

  const telegramMessage = encodeURIComponent(
    `Hello GOLDEN Event Team! I would like to place an order for the following product:,
I would like to order:

Product: ${product.title}
Price: ${product.price} ETB
Category: ${product.category}`
  );

  const telegramUrl =
    `https://t.me/edueal09?text=${telegramMessage}`;

  return (
    <main className="max-w-5xl mx-auto p-8">

      <div className="grid md:grid-cols-2 gap-8">

        <div>
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full rounded-lg"
          />
        </div>

        <div>

          <h1 className="text-3xl font-bold mb-4">
            {product.title}
          </h1>

          <p className="text-gray-600 mb-4">
            {product.description}
          </p>

          <p className="text-xl font-bold text-green-600 mb-4">
            {product.price} ETB
          </p>

          {product.category && (
            <p className="mb-2">
              <strong>Category:</strong>{" "}
              {product.category}
            </p>
          )}

          {product.occasion && (
            <p className="mb-2">
              <strong>Occasion:</strong>{" "}
              {product.occasion}
            </p>
          )}

          {product.items?.length > 0 && (
            <>
              <h2 className="font-bold mt-6 mb-2">
                Included Items
              </h2>

              <ul className="list-disc ml-6">
                {product.items.map(
                  (item: string, index: number) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>
            </>
          )}

          <a
            href={telegramUrl}
            target="_blank"
            className="inline-block mt-8 bg-green-600 text-white px-6 py-3 rounded"
          >
            Order Now 🎁
          </a>

        </div>
      </div>

    </main>
  );
}
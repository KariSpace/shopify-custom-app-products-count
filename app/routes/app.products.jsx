import React from 'react';
import { Page, Card, Layout, TextContainer, DataTable } from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useLoaderData } from '@remix-run/react';
import { authenticate } from "../shopify.server.js";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      {
        products(first: 100, query: "status:ACTIVE") {
          edges {
            node {
              id,
              title,
              handle
            }
          }
        }
      }`
  ).then(res => res.json())
    .catch(ex => {
      console.error("Error fetching products:", ex);
      return { products: [] };
    });

  const products = response ? response.data.products.edges : [];
  console.log(`Number of active products: ${products.length}`);
  return json({ products });
};

const Products = () => {
  const { products } = useLoaderData();

  // Log the number of products to the console
  console.log(`Number of products: ${products.length}`);

  const rows = products.map(({ node }) => [
    node.title,
    node.handle,
    node.id
  ]);

  return (
    <Page title={`Products amount: ${products.length}`}>
      <Layout>
        <Layout.Section>
          <Card>
            <DataTable
              columnContentTypes={['text', 'text', 'text']}
              headings={['Product Title', 'Product Handle', 'Product ID']}
              rows={rows}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Products;

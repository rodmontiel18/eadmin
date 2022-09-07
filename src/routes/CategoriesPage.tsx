import { FC } from 'react';
import Categories from '../components/Categories/Categories';
import Layout from '../components/Layout/Layout';

const CategoriesPage: FC = () => {
  return (
    <Layout>
      <Categories />
    </Layout>
  );
};

export default CategoriesPage;

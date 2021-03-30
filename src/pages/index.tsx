import Link from 'next/link';
import { GetStaticProps } from 'next';
import { ReactNode, useCallback, useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../services/prismic';
import { formatDate } from '../utils/formatDate';
import Header from '../components/Header';

import styles from './home.module.scss';
import commonStyles from '../styles/common.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const Home: React.FC<HomeProps> = ({ postsPagination }) => {
  const [posts, setPosts] = useState(postsPagination);

  const handleLoadMorePosts = useCallback(async () => {
    const response = await fetch(posts.next_page);
    const data = await response.json();

    setPosts(state => ({
      ...state,
      ...data,
      results: [...state.results, ...data.results],
    }));
  }, [posts]);

  return (
    <>
      <Header />
      <main className={commonStyles.container}>
        {posts.results.map(post => (
          <div key={post.uid} className={styles.post}>
            <Link href={`/post/${post.uid}`}>
              <a>{post.data.title}</a>
            </Link>
            <p className={styles.subtitle}>{post.data.subtitle}</p>
            <div className={styles.metaData}>
              <div>
                <FiCalendar />
                <span>{formatDate(post.first_publication_date)}</span>
              </div>
              <div>
                <FiUser />
                <span>{post.data.author}</span>
              </div>
            </div>
          </div>
        ))}
        {posts.next_page && (
          <button
            type="button"
            className={styles.loadButton}
            onClick={handleLoadMorePosts}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
};
export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    { pageSize: 1 }
  );
  return {
    props: {
      postsPagination: postsResponse,
    },
  };
};

export default Home;

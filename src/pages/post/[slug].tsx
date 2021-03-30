import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import { formatDate } from '../../utils/formatDate';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
      alt: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Header />
      <section className={styles.banner}>
        <img src={post.data.banner.url} alt={post.data.banner.alt} />
      </section>
      <main className={commonStyles.container}>
        <h1 className={styles.title}>{post.data.title}</h1>
        <section className={styles.metadata}>
          <div>
            <FiCalendar />
            <span>{formatDate(post.first_publication_date)}</span>
          </div>
          <div>
            <FiUser />
            <span>{post.data.author}</span>
          </div>
          <div>
            <FiClock />
            <span>4 min</span>
          </div>
        </section>
        <section className={styles.content}>
          {post.data.content.map(content => (
            <div key={content.heading}>
              <h2>{content.heading}</h2>
              {content.body.map(body => (
                <p key={body.text}>{body.text}</p>
              ))}
            </div>
          ))}
        </section>
      </main>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.predicates.at('document.type', 'posts')
  );

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', slug as string, {});

  return {
    props: {
      post: response,
    },
  };
};

export default Post;

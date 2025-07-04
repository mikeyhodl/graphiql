import type { FC } from 'react';
import type { GraphQLSchema } from 'graphql';
import { MarkdownContent } from '@graphiql/react';
import { ExplorerSection } from './section';
import { TypeLink } from './type-link';
import './schema-documentation.css';

type SchemaDocumentationProps = {
  /**
   * The schema that should be rendered.
   */
  schema: GraphQLSchema;
};

export const SchemaDocumentation: FC<SchemaDocumentationProps> = ({
  schema,
}) => {
  const queryType = schema.getQueryType();
  const mutationType = schema.getMutationType();
  const subscriptionType = schema.getSubscriptionType();
  const typeMap = schema.getTypeMap();
  const ignoreTypesInAllSchema = [
    queryType?.name,
    mutationType?.name,
    subscriptionType?.name,
  ];

  return (
    <>
      <MarkdownContent type="description">
        {schema.description ||
          'A GraphQL schema provides a root type for each kind of operation.'}
      </MarkdownContent>
      <ExplorerSection title="Root Types">
        {queryType ? (
          <div>
            <span className="graphiql-doc-explorer-root-type">query</span>
            {': '}
            <TypeLink type={queryType} />
          </div>
        ) : null}
        {mutationType && (
          <div>
            <span className="graphiql-doc-explorer-root-type">mutation</span>
            {': '}
            <TypeLink type={mutationType} />
          </div>
        )}
        {subscriptionType && (
          <div>
            <span className="graphiql-doc-explorer-root-type">
              subscription
            </span>
            {': '}
            <TypeLink type={subscriptionType} />
          </div>
        )}
      </ExplorerSection>
      <ExplorerSection title="All Schema Types">
        <div>
          {Object.values(typeMap).map(type => {
            if (
              ignoreTypesInAllSchema.includes(type.name) ||
              type.name.startsWith('__')
            ) {
              return null;
            }

            return (
              <div key={type.name}>
                <TypeLink type={type} />
              </div>
            );
          })}
        </div>
      </ExplorerSection>
    </>
  );
};

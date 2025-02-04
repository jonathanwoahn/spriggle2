import MuiMarkdown, { getOverrides } from "mui-markdown";

export default function LegalMuiMarkdown({content}: {content: string}) {

  return (
    <MuiMarkdown
      overrides={{
        ...getOverrides(),
        h1: {
          component: 'h1',
          props: {
            style: {
              marginBottom: '16px',
            },
          },
        },
        h2: {
          component: 'h2',
          props: {
            style: {
              marginBottom: '16px',
            },
          },
        },
        h3: {
          component: 'h3',
          props: {
            style: {
              marginBottom: '16px',
            },
          },
        },
        li: {
          component: 'li',
          props: {
            style: {
              marginBottom: '16px',
            },
          },
        },
        p: {
          component: 'p',
          props: {
            style: {
              marginBottom: '16px',
            },
          },
        },
      }}
    >
      {content}
    </MuiMarkdown>
  );
  
}
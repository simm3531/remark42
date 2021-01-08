declare module '*.svg' {
  const { FunctionComponent } = require('preact');
  const url: string;

  export const ReactComponent: FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default url;
}

export default function Container({ as: Component = 'div', className = '', children }) {
  return <Component className={`page-shell ${className}`.trim()}>{children}</Component>;
}

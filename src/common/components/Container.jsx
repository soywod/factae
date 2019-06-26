import React from 'react'

const styles = {
  container: {
    padding: '25px',
    minHeight: 'calc(100vh - 64px)',
  },
}

function Container({children}) {
  return <div style={styles.container}>{children}</div>
}

export default Container

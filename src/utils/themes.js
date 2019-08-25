import {useEffect, useState} from 'react'

export function useThemes() {
  const [themes, setThemes] = useState([])

  async function fetchThemes() {
    return fetch('https://api.github.com/repos/factae/functions/contents/functions/themes')
      .then(res => res.json())
      .then(themes => themes.filter(t => t.type === 'dir').map(t => t.name))
      .then(setThemes)
  }

  useEffect(() => {
    fetchThemes()
  }, [])

  return themes
}

export function getThemeUrl(theme) {
  return `https://github.com/factae/functions/blob/master/functions/themes/${theme}/preview.pdf`
}

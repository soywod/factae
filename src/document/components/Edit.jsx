import React, {useEffect, useState} from 'react'
import find from 'lodash/fp/find'

import Container from '../../common/components/Container'
import {useDocuments} from '../hooks'
import EditDefault from './EditDefault'
import EditImport from './EditImport'

function EditDocument(props) {
  const documents = useDocuments()
  const [document, setDocument] = useState(props.location.state)

  useEffect(() => {
    if (documents && !document) {
      setDocument(find({id: props.match.params.id}, documents))
    }
  }, [document, documents, props.match.params.id])

  if (!document) {
    return null
  }

  const EditComponent = document.imported ? EditImport : EditDefault

  return (
    <Container>
      <EditComponent document={document} />
    </Container>
  )
}

export default EditDocument

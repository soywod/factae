module.exports = {
  locals: {
    type: 'quotation',
    profile: {
      firstName: 'Patrick',
      lastName: 'POTÉ',
      address: '3 rue du roseau',
      zip: '12345',
      city: 'Corneville',
    },
    client: {
      firstName: 'Paul',
      lastName: 'SOUBOTA',
      address: '13 rue du port',
      zip: '67890',
      city: 'Mangelle',
      country: 'France',
    },
    document: {
      type: 'quotation',
      items: [
        {designation: 'item a', quantity: 1, unitPrice: '200.00 €', amount: '200.00 €'},
        {designation: 'item b', quantity: 2, unitPrice: '150.40 €', amount: '300.80 €'},
        {
          designation:
            'item very very very very very very very very very very very very very very very very very very very very very very long',
          quantity: 2,
          unitPrice: '150.40 €',
          amount: '300.80 €',
        },
      ],
    },
  },
}

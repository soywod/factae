module.exports = {
  locals: {
    profile: {
      tradingName: 'My Company',
      firstName: 'Patrick',
      lastName: 'POTÉ',
      address: '3 rue du roseau',
      zip: '12345',
      city: 'Corneville',
      siren: 'XXX XXX XXX',
      apeCode: 'XXXX YY',
      taxId: 'XXYYZZAABB',
      phone: '+33 X XX XX XX XX',
      email: 'XXXXXX@XXXX.XX',
      rib: 'XXXXX XXXXX XXXXX XXXX XX',
      iban: 'FRXX XXXX XXX XXX XXX',
      bic: 'XXXXXXXX',
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
        {designation: 'item a', quantity: 1, unitPrice: 20000, amount: 20000},
        {designation: 'item b', quantity: 2, unitPrice: 15040, amount: 30080},
        {
          designation:
            'item very very very very very very very very very very very very very very very very very very very very very very long',
          quantity: 2,
          unitPrice: 15040,
          amount: 30080,
        },
      ],
      taxRate: 20,
      conditions: 'Condition A\nCondition B',
      totalHT: 10000,
      totalTVA: 2000,
      totalTTC: 12000,
    },
  },
}

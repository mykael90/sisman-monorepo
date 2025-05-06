'use server';

import fetchApiSisman from '../../../lib/fetch/api-sisman';

export async function getUsers(accessTokenSisman: string | undefined) {
  //TODO: vai ter que usar fetchApiSismanUserSession por causa que é uma listagem para administrador, diferente das outras listagens.
  const response = await fetchApiSisman('/users', accessTokenSisman, {
    cache: 'no-store'
  });
  const data = await response.json();
  // console.log(data);
  const aguarde = await new Promise(resolve => setTimeout(resolve, 2000));
  return data;
}

export async function addUser(userId, formData) {
  const data = Object.fromEntries(formData);
  data.userId = userId;

  const response = await fetchApiSisman('/users', undefined, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

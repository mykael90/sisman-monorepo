'use server';

import fetchApiSisman from '../../../lib/fetch/api-sisman';

export async function getUsers() {
  const response = await fetchApiSisman('/users', undefined, {
    cache: 'no-store'
  });
  const data = response.json();
  // console.log(data);
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

'use server'

import fetchApiSismanUserSession from '../../../lib/fetch/api-sisman-user-session';

export async function getUsers() {
  const response = await fetchApiSismanUserSession('/users', {
    cache: 'no-store'
  });
  const data =  await response.json();
  console.log(data);
  return data;
}

export async function addUser(userId, formData) {
  const data = Object.fromEntries(formData);
  data.userId = userId;

  const response = await fetchApiSismanUserSession('/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

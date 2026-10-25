import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeContactRequest, sendContactRequest, CONTACT_FORM_NAME, CONTACT_FORM_ENDPOINT } from '../src/app/services/contact.ts';
const sample = {name:' Maria Silva ',email:' maria@email.pt ',phone:' 912 345 678 ',audience:'Particular',subject:'Eletricidade e gás',message:' Gostaria de receber informações. ',consent:true,'bot-field':''};
test('serializes all contact data and trims strings',()=>{
  const data=encodeContactRequest(sample);
  assert.equal(data.get('form-name'),CONTACT_FORM_NAME);
  assert.equal(data.get('name'),'Maria Silva');
  assert.equal(data.get('message'),'Gostaria de receber informações.');
  assert.equal(data.get('consent'),'Sim');
});
test('submits contact form to the configured endpoint',async()=>{
  let called=false;
  await sendContactRequest(encodeContactRequest(sample),async(url,opts)=>{
    called=true;assert.equal(url,CONTACT_FORM_ENDPOINT);
    assert.equal(opts.method,'POST');
    assert.match(opts.body,/form-name=rmmj-contacto/);
    return {ok:true};
  });
  assert.ok(called);
});
test('rejects a server response with a non-success status',async()=>{
  await assert.rejects(()=>sendContactRequest(encodeContactRequest(sample),async()=>({ok:false,status:400})),/não aceitou/);
});

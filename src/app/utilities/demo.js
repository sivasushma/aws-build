const arr = ['5ef4603289c4131f2961c4eb', '5ef470520a8f8e2a5eb6773a', '5ef470600a8f8e2a5eb6773b',
  '5ef470700a8f8e2a5eb6773c', '5ef470890a8f8e2a5eb6773d', '5ef470950a8f8e2a5eb6773e',
  '5ef470a00a8f8e2a5eb6773f', '5ef4b594d7ae2e176b5b3c04', '5ef4b5add7ae2e176b5b3c05',
  '5ef4b5bdd7ae2e176b5b3c06'];
Role.update({name: 'Admin'}, {access_list: arr}).then((data) => {
  console.log(data);
}).catch((err) => {
  console.log(err);
});

// To Do add custom role. While adding the role becarefull that two tenants can have same named role

// Role name should come in access_list array in response.
// Modify responses according to Super visor login view

// ['5ef4603289c4131f2961c4eb', '5ef470520a8f8e2a5eb6773a', '5ef470600a8f8e2a5eb6773b',
//     '5ef470700a8f8e2a5eb6773c', '5ef470890a8f8e2a5eb6773d', '5ef470950a8f8e2a5eb6773e',
//     '5ef470a00a8f8e2a5eb6773f', '5ef4b594d7ae2e176b5b3c04', '5ef4b5add7ae2e176b5b3c05',
//     '5ef4b5bdd7ae2e176b5b3c06']

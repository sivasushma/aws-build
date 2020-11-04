export const slug_to_text = (slug)=>{
  return slug.split('_').map((part)=> {
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join(' ');
};

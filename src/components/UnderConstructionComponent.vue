<template>
  <div :id="UNDER_CONSTRUCTION_COMPONENT">
    <div :id="UNDER_CONSTRUCTION_ITEMS">
      <h1 :id="UNDER_CONSTRUCTION_HEADER">UNDER CONSTRUCTION</h1>
      <img :id="UNDER_CONSTRUCTION_IMAGE" alt="under construction image" src="/60028.jpg">
      <p><em>Our api website is under construction, but there's a special surprise for early users!</em></p>
    </div>
  </div>
</template>

<script>

export default {
  name: 'UnderConstructionComponent',
  data() {
    return {

      UNDER_CONSTRUCTION_COMPONENT: 'under-construction-component',
      UNDER_CONSTRUCTION_HEADER: 'under-construction-header',
      UNDER_CONSTRUCTION_ITEMS: 'under-construction-items',
      UNDER_CONSTRUCTION_IMAGE: 'construction-image',
    }
  },

  mounted() {
    // sends a message to user that verifies they want to exit the under construction page.
    // window.onbeforeunload = function (event) {
    //   return event.preventDefault();
    // }
  },
}

</script>

<style>

#under-construction-items {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 100px;
}

#construction-image {
  width: 30vw;
  height: auto;
  margin: auto;
}

</style>

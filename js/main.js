let eventBus = new Vue();

Vue.component('product-review', {
    template: `
      <form class="review-form" @submit.prevent="onSubmit">
        <p v-if="errors.length">
          <b>Please correct the following error(s):</b>
        <ul>
          <li v-for="error in errors">{{ error }}</li>
        </ul>
        </p>
        <p>
          <label for="name">Name:</label>
          <input id="name" v-model="name" placeholder="Your name">
        </p>
        <p>
          <label for="review">Review:</label>
          <textarea id="review" v-model="review"></textarea>
        </p>
        <p>
          <label for="rating">Rating:</label>
          <select id="rating" v-model.number="rating">
            <option>5</option>
            <option>4</option>
            <option>3</option>
            <option>2</option>
            <option>1</option>
          </select>
        </p>
        <p>
          <input type="submit" value="Submit">
        </p>
      </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: []
        };
    },
    methods: {
        onSubmit() {
            this.errors = [];
            if (this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating
                };
                eventBus.$emit('review-submitted', productReview);
                this.name = null;
                this.review = null;
                this.rating = null;
            } else {
                if (!this.name) this.errors.push("Name is required.");
                if (!this.review) this.errors.push("Review is required.");
                if (!this.rating) this.errors.push("Rating is required.");
            }
        }
    }
});

Vue.component('product-tabs', {
    template: `
      <div>
        <!-- Вкладки -->
        <ul>
          <span
              class="tab"
              :class="{ activeTab: selectedTab === tab }"
              v-for="tab in tabs"
              @click="selectedTab = tab"
          >
            {{ tab }}
          </span>
        </ul>

        <!-- Фильтр по рейтингу -->
        <div v-show="selectedTab === 'Reviews'">
          <label for="filter-rating">Filter by Rating:</label>
          <select id="filter-rating" v-model="filterRating">
            <option value="">All</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <!-- Отображение отзывов -->
          <p v-if="!filteredReviews.length">There are no reviews yet.</p>
          <ul v-else>
            <li v-for="review in filteredReviews">
              <p>Name: {{ review.name }}</p>
              <p>Rating: {{ review.rating }}</p>
              <p>{{ review.review }}</p>
            </li>
          </ul>
        </div>

        <!-- Создание отзыва -->
        <div v-show="selectedTab === 'Make a Review'">
          <product-review @review-submitted="addReview"></product-review>
        </div>

        <!-- Информация о доставке -->
        <div v-show="selectedTab === 'Shipping'">
          <p>Shipping: {{ shipping }}</p>
        </div>

        <!-- Детали продукта -->
        <div v-show="selectedTab === 'Details'">
          <ul>
            <li v-for="detail in details">{{ detail }}</li>
          </ul>
        </div>
      </div>
    `,
    props: {
        details: {
            type: Array,
            required: false
        },
        shipping: {
            type: String,
            required: false
        },
        reviews: {
            type: Array,
            required: false
        }
    },
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews',
            filterRating: null
        };
    },
    computed: {
        filteredReviews() {
            if (!this.filterRating) {
                return this.reviews;
            }
            return this.reviews.filter(review => review.rating === parseInt(this.filterRating));
        }
    },
    methods: {
        addReview(review) {
            this.reviews.push(review);
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview);
        });
    }
});

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
      <div class="product">
        <div class="product-image">
          <img :src="image" :alt="altText"/>
        </div>
        <div class="product-info">
          <h1>{{ title }}</h1>
          <p v-if="inStock">In stock</p>
          <p v-else>Out of Stock</p>
          <p>Shipping: {{ shipping }}</p>
          <ul>
            <li v-for="detail in details">{{ detail }}</li>
          </ul>
          <div class="color-box"
               v-for="(variant, index) in variants"
               :key="variant.variantId"
               :style="{ backgroundColor: variant.variantColor }"
               @mouseover="updateProduct(index)">
          </div>
          <button v-on:click="addToCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">
            Add to cart
          </button>
          <product-tabs
              :details="details"
              :shipping="shipping"
              :reviews="reviews"
          ></product-tabs>
        </div>
      </div>
    `,
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            selectedVariant: 0,
            altText: "A pair of socks",
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0
                }
            ],
            cart: 0,
            reviews: []
        };
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
        }
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity > 0;
        },
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return "$2.99";
            }
        }
    }
});

let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        }
    }
});
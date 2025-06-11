const API_KEY = '2c41a66f745ae97a5d1149cb8c409d84';
    const BASE_URL = 'https://api.themoviedb.org/3';
    const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
    const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

    let currentMovieData = null;

    // Event listeners
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch();
    });

    async function handleSearch() {
      const query = document.getElementById('searchInput').value.trim();
      if (query) {
        searchMovies(query);
      }
    }

    async function searchMovies(query) {
      const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;

      try {
        showLoading();
        const res = await fetch(url);
        const data = await res.json();

        const resultsContainer = document.getElementById('movieResults');
        resultsContainer.innerHTML = '';

        if (data.results.length > 0) {
          data.results.forEach(movie => {
            const movieCard = createMovieCard(movie);
            resultsContainer.appendChild(movieCard);
          });
        } else {
          resultsContainer.innerHTML = `
            <div class="col-span-full text-center py-16">
              <div class="text-8xl mb-6 opacity-60">🎭</div>
              <p class="text-amber-400 text-2xl font-cinzel font-semibold mb-3">No Films Found</p>
              <p class="text-amber-200 text-lg">Try searching with different keywords to discover new cinematic treasures</p>
            </div>
          `;
        }
      } catch (error) {
        console.error(error);
        showError();
      }
    }

    function createMovieCard(movie) {
      const col = document.createElement('div');
      col.className = 'group cursor-pointer';
      col.onclick = () => openMovieModal(movie.id);

      col.innerHTML = `
        <div class="movie-card bg-card-gradient rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-400 h-full flex flex-col backdrop-blur-sm">
          <div class="relative overflow-hidden">
            <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'https://via.placeholder.com/500x750/1a1a1a/d4af37?text=No+Image'}" 
                 class="w-full h-64 sm:h-72 md:h-80 object-cover transition-transform duration-500 group-hover:scale-110" 
                 alt="${movie.title}">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400">
              <div class="bg-gold rounded-full p-4 transform scale-75 group-hover:scale-100 transition-all duration-400 shadow-2xl">
                <svg class="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-gray-900/90 to-black/90">
            <div>
              <h5 class="text-xl font-bold text-amber-50 mb-3 line-clamp-2 group-hover:text-gold transition-colors duration-300 font-cinzel">${movie.title}</h5>
              <p class="text-amber-300 text-sm mb-3">
                <span class="inline-flex items-center">
                  <svg class="w-4 h-4 mr-2 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                  </svg>
                  ${movie.release_date || 'N/A'}
                </span>
              </p>
            </div>
            ${movie.vote_average ? `
              <div class="flex items-center mt-3">
                <svg class="w-5 h-5 text-gold mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span class="text-amber-200 font-semibold">${movie.vote_average.toFixed(1)}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;

      return col;
    }

    async function openMovieModal(movieId) {
      const modal = document.getElementById('movieModal');
      const modalContent = document.getElementById('modalContent');
      
      modal.classList.remove('hidden');
      modalContent.innerHTML = '<div class="flex items-center justify-center p-16"><div class="animate-spin rounded-full h-16 w-16 border-4 border-gold border-t-transparent"></div></div>';

      try {
        // Fetch movie details
        const movieRes = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,watch/providers`);
        const movieData = await movieRes.json();
        
        // Fetch cast
        const creditsRes = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`);
        const creditsData = await creditsRes.json();

        currentMovieData = movieData;
        
        renderMovieModal(movieData, creditsData);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        modalContent.innerHTML = `
          <div class="p-12 text-center">
            <p class="text-amber-400 text-2xl font-cinzel font-semibold mb-4">Error loading movie details</p>
            <button onclick="closeModal()" class="mt-6 px-6 py-3 bg-gradient-to-r from-gold to-amber-500 text-black font-semibold rounded-lg hover:from-amber-500 hover:to-gold transition-all duration-300">Close</button>
          </div>
        `;
      }
    }

    function renderMovieModal(movie, credits) {
      const modalContent = document.getElementById('modalContent');
      const trailerVideo = movie.videos?.results?.find(video => video.type === 'Trailer' && video.site === 'YouTube');
      const watchProviders = movie['watch/providers']?.results?.US || {};
      
      modalContent.innerHTML = `
        <div class="relative">
          <!-- Close Button -->
          <button onclick="closeModal()" class="absolute top-6 right-6 z-10 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full p-3 transition-all duration-300 border border-gold/30">
            <svg class="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <!-- Backdrop Image -->
          <div class="relative h-64 md:h-96 overflow-hidden rounded-t-2xl">
            <img src="${movie.backdrop_path ? BACKDROP_BASE_URL + movie.backdrop_path : 'https://via.placeholder.com/1280x720/1a1a1a/d4af37?text=No+Image'}" 
                 class="w-full h-full object-cover" alt="${movie.title}">
            <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
          </div>

          <!-- Content -->
          <div class="p-8 md:p-10">
            <div class="flex flex-col md:flex-row gap-8">
              <!-- Poster -->
              <div class="flex-shrink-0">
                <div class="golden-border">
                  <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'https://via.placeholder.com/300x450/1a1a1a/d4af37?text=No+Image'}" 
                       class="w-52 h-80 object-cover shadow-2xl mx-auto md:mx-0" alt="${movie.title}">
                </div>
              </div>

              <!-- Details -->
              <div class="flex-1">
                <h2 class="text-4xl md:text-5xl font-cinzel font-bold mb-6 text-amber-50 glow-text">${movie.title}</h2>
                
                <div class="flex flex-wrap items-center gap-6 mb-6 text-amber-200">
                  <span class="flex items-center text-lg">
                    <svg class="w-5 h-5 mr-2 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                    </svg>
                    ${movie.release_date}
                  </span>
                  <span class="flex items-center text-lg">
                    <svg class="w-5 h-5 mr-2 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                    </svg>
                    ${movie.runtime} min
                  </span>
                  ${movie.vote_average ? `
                    <span class="flex items-center text-lg">
                      <svg class="w-5 h-5 mr-2 text-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      ${movie.vote_average.toFixed(1)}/10
                    </span>
                  ` : ''}
                </div>

                <div class="mb-8">
                  <h3 class="text-xl font-cinzel font-semibold mb-4 text-gold">Genres</h3>
                  <div class="flex flex-wrap gap-3">
                    ${movie.genres.map(genre => `<span class="px-4 py-2 bg-gradient-to-r from-gold/20 to-amber-500/20 border border-gold/40 text-amber-100 text-sm rounded-full font-medium">${genre.name}</span>`).join('')}
                  </div>
                </div>

                <div class="mb-8">
                  <h3 class="text-xl font-cinzel font-semibold mb-4 text-gold">Synopsis</h3>
                  <p class="text-amber-100 leading-relaxed text-lg">${movie.overview || 'No synopsis available.'}</p>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-wrap gap-4 mb-8">
                  ${trailerVideo ? `
                    <button onclick="playTrailer('${trailerVideo.key}')" class="px-8 py-4 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-cinzel font-semibold text-lg rounded-xl transition-all duration-300 flex items-center shadow-2xl transform hover:scale-105">
                      <svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
                      </svg>
                      Watch Trailer
                    </button>
                  ` : ''}
                  
                  <button onclick="showWatchOptions()" class="px-8 py-4 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-cinzel font-semibold text-lg rounded-xl transition-all duration-300 flex items-center shadow-2xl transform hover:scale-105">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    Where to Watch
                  </button>
                </div>

                <!-- Cast -->
                ${credits.cast && credits.cast.length > 0 ? `
                  <div>
                    <h3 class="text-xl font-cinzel font-semibold mb-4 text-gold">Featured Cast</h3>
                    <div class="flex space-x-6 overflow-x-auto pb-4">
                      ${credits.cast.slice(0, 10).map(actor => `
                        <div class="flex-shrink-0 text-center">
                          <div class="golden-border mb-3">
                            <img src="${actor.profile_path ? IMAGE_BASE_URL + actor.profile_path : 'https://via.placeholder.com/100x150/1a1a1a/d4af37?text=No+Image'}" 
                                 class="w-20 h-24 object-cover" alt="${actor.name}">
                          </div>
                          <p class="text-sm text-amber-200 w-20 truncate font-medium">${actor.name}</p>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function playTrailer(videoKey) {
      const modalContent = document.getElementById('modalContent');
      modalContent.innerHTML = `
        <div class="relative">
          <button onclick="renderMovieModal(currentMovieData, {})" class="absolute top-6 right-6 z-10 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full p-3 transition-all duration-300 border border-gold/30">
            <svg class="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
          <div class="aspect-video">
            <iframe 
              src="https://www.youtube.com/embed/${videoKey}?autoplay=1" 
              class="w-full h-full rounded-t-2xl"
              frameborder="0" 
              allow="autoplay; encrypted-media" 
              allowfullscreen>
            </iframe>
          </div>
          <div class="p-8">
            <h3 class="text-3xl font-cinzel font-bold mb-3 text-amber-50 glow-text">${currentMovieData.title} - Trailer</h3>
            <p class="text-amber-200 text-lg">Enjoy the official cinematic preview!</p>
          </div>
        </div>
      `;
    }

    function showWatchOptions() {
      const streaming = [
        { name: 'Netflix', url: 'https://www.netflix.com/search?q=' + encodeURIComponent(currentMovieData.title), logo: '🎬' },
        { name: 'Disney+', url: 'https://www.disneyplus.com/search?q=' + encodeURIComponent(currentMovieData.title), logo: '🏰' },
        { name: 'Amazon Prime', url: 'https://www.amazon.com/s?k=' + encodeURIComponent(currentMovieData.title) + '&i=instant-video', logo: '📦' },
        { name: 'Hulu', url: 'https://www.hulu.com/search?q=' + encodeURIComponent(currentMovieData.title), logo: '📺' },
        { name: 'HBO Max', url: 'https://play.hbomax.com/search?q=' + encodeURIComponent(currentMovieData.title), logo: '🎭' },
        { name: 'Apple TV+', url: 'https://tv.apple.com/search?term=' + encodeURIComponent(currentMovieData.title), logo: '🍎' }
      ];

      const modalContent = document.getElementById('modalContent');
      modalContent.innerHTML = `
        <div class="p-10">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-3xl font-cinzel font-bold text-amber-50 glow-text">Where to Watch "${currentMovieData.title}"</h2>
            <button onclick="closeModal()" class="text-amber-400 hover:text-gold transition-colors duration-300">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            ${streaming.map(platform => `
              <a href="${platform.url}" target="_blank" class="flex items-center p-6 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 rounded-xl transition-all duration-300 border border-gold/20 hover:border-gold/40 transform hover:scale-105">
                <span class="text-3xl mr-5">${platform.logo}</span>
                <div class="flex-1">
                  <h3 class="font-cinzel font-semibold text-lg text-amber-50">${platform.name}</h3>
                  <p class="text-amber-300">Search on ${platform.name}</p>
                </div>
                <svg class="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </a>
            `).join('')}
          </div>
          
          <div class="golden-border">
            <div class="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 p-6">
              <h3 class="font-cinzel font-semibold mb-3 text-gold flex items-center">
                <span class="text-2xl mr-3">💡</span>
                Important Note
              </h3>
              <p class="text-amber-200 leading-relaxed">Availability varies by region and subscription status. Click on any platform above to search for this cinematic masterpiece.</p>
            </div>
          </div>
          
          <button onclick="renderMovieModal(currentMovieData, {})" class="mt-8 px-8 py-4 bg-gradient-to-r from-gold to-amber-500 hover:from-amber-500 hover:to-gold text-black font-cinzel font-semibold text-lg rounded-xl transition-all duration-300 transform hover:scale-105">
            ← Back to Film Details
          </button>
        </div>
      `;
    }

    function closeModal() {
      document.getElementById('movieModal').classList.add('hidden');
    }

    function goHome() {
      closeModal();
      document.getElementById('searchInput').value = '';
      document.getElementById('movieResults').innerHTML = '';
    }

    function showLoading() {
      document.getElementById('movieResults').innerHTML = `
        <div class="col-span-full flex justify-center py-16">
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-gold border-t-transparent shadow-2xl"></div>
        </div>
      `;
    }

    function showError() {
      document.getElementById('movieResults').innerHTML = `
        <div class="col-span-full text-center py-16">
          <div class="text-8xl mb-6 opacity-60">⚠️</div>
          <p class="text-amber-400 text-2xl font-cinzel font-semibold mb-3">Something Went Wrong</p>
          <p class="text-amber-200 text-lg">Please try again later to continue your cinematic journey</p>
        </div>
      `;
    }

    // Close modal when clicking outside
    document.getElementById('movieModal').addEventListener('click', (e) => {
      if (e.target.id === 'movieModal') {
        closeModal();
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
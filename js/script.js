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
            <div class="col-span-full text-center py-12">
              <div class="text-6xl mb-4">🎬</div>
              <p class="text-red-400 text-xl font-semibold mb-2">No movies found</p>
              <p class="text-gray-400">Try searching with different keywords</p>
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
        <div class="bg-gray-800 rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-700 hover:border-blue-500 h-full flex flex-col">
          <div class="relative overflow-hidden">
            <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'https://via.placeholder.com/500x750/374151/9ca3af?text=No+Image'}" 
                 class="w-full h-64 sm:h-72 md:h-80 object-cover transition-transform duration-300 group-hover:scale-110" 
                 alt="${movie.title}">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="bg-blue-600 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h5 class="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors duration-300">${movie.title}</h5>
              <p class="text-gray-400 text-sm mb-2">
                <span class="inline-flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                  </svg>
                  ${movie.release_date || 'N/A'}
                </span>
              </p>
            </div>
            ${movie.vote_average ? `
              <div class="flex items-center mt-2">
                <svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span class="text-gray-300 text-sm">${movie.vote_average.toFixed(1)}</span>
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
      modalContent.innerHTML = '<div class="flex items-center justify-center p-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>';

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
          <div class="p-8 text-center">
            <p class="text-red-400 text-xl">Error loading movie details</p>
            <button onclick="closeModal()" class="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Close</button>
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
          <button onclick="closeModal()" class="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all duration-200">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <!-- Backdrop Image -->
          <div class="relative h-64 md:h-96 overflow-hidden rounded-t-2xl">
            <img src="${movie.backdrop_path ? BACKDROP_BASE_URL + movie.backdrop_path : 'https://via.placeholder.com/1280x720/374151/9ca3af?text=No+Image'}" 
                 class="w-full h-full object-cover" alt="${movie.title}">
            <div class="absolute inset-0 bg-gradient-to-t from-gray-800 via-transparent to-transparent"></div>
          </div>

          <!-- Content -->
          <div class="p-6 md:p-8">
            <div class="flex flex-col md:flex-row gap-6">
              <!-- Poster -->
              <div class="flex-shrink-0">
                <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'https://via.placeholder.com/300x450/374151/9ca3af?text=No+Image'}" 
                     class="w-48 h-72 object-cover rounded-lg shadow-lg mx-auto md:mx-0" alt="${movie.title}">
              </div>

              <!-- Details -->
              <div class="flex-1">
                <h2 class="text-3xl md:text-4xl font-bold mb-4 text-white">${movie.title}</h2>
                
                <div class="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-300">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                    </svg>
                    ${movie.release_date}
                  </span>
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                    </svg>
                    ${movie.runtime} min
                  </span>
                  ${movie.vote_average ? `
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      ${movie.vote_average.toFixed(1)}/10
                    </span>
                  ` : ''}
                </div>

                <div class="mb-6">
                  <h3 class="text-lg font-semibold mb-2">Genres</h3>
                  <div class="flex flex-wrap gap-2">
                    ${movie.genres.map(genre => `<span class="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">${genre.name}</span>`).join('')}
                  </div>
                </div>

                <div class="mb-6">
                  <h3 class="text-lg font-semibold mb-2">Overview</h3>
                  <p class="text-gray-300 leading-relaxed">${movie.overview || 'No overview available.'}</p>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-wrap gap-4 mb-6">
                  ${trailerVideo ? `
                    <button onclick="playTrailer('${trailerVideo.key}')" class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center">
                      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
                      </svg>
                      Watch Trailer
                    </button>
                  ` : ''}
                  
                  <button onclick="showWatchOptions()" class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    Where to Watch
                  </button>
                </div>

                <!-- Cast -->
                ${credits.cast && credits.cast.length > 0 ? `
                  <div>
                    <h3 class="text-lg font-semibold mb-3">Cast</h3>
                    <div class="flex space-x-4 overflow-x-auto pb-2">
                      ${credits.cast.slice(0, 10).map(actor => `
                        <div class="flex-shrink-0 text-center">
                          <img src="${actor.profile_path ? IMAGE_BASE_URL + actor.profile_path : 'https://via.placeholder.com/100x150/374151/9ca3af?text=No+Image'}" 
                               class="w-16 h-20 object-cover rounded-lg mb-2" alt="${actor.name}">
                          <p class="text-xs text-gray-300 w-16 truncate">${actor.name}</p>
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
          <button onclick="renderMovieModal(currentMovieData, {})" class="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all duration-200">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div class="p-6">
            <h3 class="text-2xl font-bold mb-2">${currentMovieData.title} - Trailer</h3>
            <p class="text-gray-400">Enjoy the official trailer!</p>
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
        <div class="p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">Where to Watch "${currentMovieData.title}"</h2>
            <button onclick="closeModal()" class="text-gray-400 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            ${streaming.map(platform => `
              <a href="${platform.url}" target="_blank" class="flex items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200">
                <span class="text-2xl mr-4">${platform.logo}</span>
                <div>
                  <h3 class="font-semibold">${platform.name}</h3>
                  <p class="text-sm text-gray-400">Search on ${platform.name}</p>
                </div>
                <svg class="w-5 h-5 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </a>
            `).join('')}
          </div>
          
          <div class="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
            <h3 class="font-semibold mb-2 text-blue-400">💡 Note</h3>
            <p class="text-sm text-gray-300">Availability varies by region and subscription. Click on any platform to search for this movie.</p>
          </div>
          
          <button onclick="renderMovieModal(currentMovieData, {})" class="mt-6 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200">
            ← Back to Movie Details
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
        <div class="col-span-full flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      `;
    }

    function showError() {
      document.getElementById('movieResults').innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="text-6xl mb-4">⚠️</div>
          <p class="text-red-400 text-xl font-semibold mb-2">Something went wrong</p>
          <p class="text-gray-400">Please try again later</p>
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
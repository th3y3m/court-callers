using BusinessObjects;
using DAOs.Helper;
using DAOs.Models;
using Firebase.Storage;
using Microsoft.AspNetCore.Mvc;
using Services;
using System.Text.Json;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewsController : ControllerBase
    {
        private readonly NewsService newsService;

        public NewsController()
        {
            newsService = new NewsService();
        }

        [HttpGet]
        public async Task<ActionResult<PagingResponse<News>>> GetNews([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchQuery = null)
        {
            var pageResult = new PageResult
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            var (news, total) = await newsService.GetNews(pageResult, searchQuery);
            var response = new PagingResponse<News>
            {
                Data = news,
                Total = total
            };
            return Ok(response);
        }

        [HttpGet("NewsPage")]
        public async Task<ActionResult<PagingResponse<News>>> GetNews([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] bool IsHomepageSlideshow = true, [FromQuery] string status = "Active", [FromQuery] string searchQuery = null)
        {
            var pageResult = new PageResult
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            var (news, total) = await newsService.GetNews(pageResult, IsHomepageSlideshow, status, searchQuery);
            var response = new PagingResponse<News>
            {
                Data = news,
                Total = total
            };
            return Ok(response);
        }

        [HttpGet("SlideShowImage")]
        public ActionResult<List<News>> ShowSlideShowImage()
        {
            var slideShowImages = newsService.ShowSlideShowImage();
            return Ok(slideShowImages);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<News>> GetNew(string id)
        {
            var news = newsService.GetNew(id);

            if (news == null)
            {
                return NotFound();
            }

            return news;
        }

        [HttpPut("EditNews")]
        public async Task<IActionResult> PutNew(string id, NewsModel news)
        {
            var file = news.NewsImage;

            var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
            using (var stream = file.OpenReadStream())
            {
                var task = new FirebaseStorage("court-callers.appspot.com")
                    .Child("NewsImages")
                    .Child(fileName)
                    .PutAsync(stream);

                var downloadUrl = await task;
                news.Image = downloadUrl; // Directly assign the URL
            }

            var updatedNews = newsService.UpdateNew(id, news);
            return Ok(updatedNews);
        }

        [HttpPost]
        public async Task<ActionResult<News>> PostNew(NewsModel newsModel)
        {

            var file = newsModel.NewsImage;

            var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
            using (var stream = file.OpenReadStream())
            {
                var task = new FirebaseStorage("court-callers.appspot.com")
                    .Child("NewsImages")
                    .Child(fileName)
                    .PutAsync(stream);

                var downloadUrl = await task;
                newsModel.Image = downloadUrl; // Directly assign the URL
            }

            var newNews = newsService.AddNew(newsModel);
            return CreatedAtAction("GetNew", new { id = newNews.NewId }, newNews);

        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNew(string id)
        {
            newsService.DeleteNew(id);
            return NoContent();
        }


    }
}

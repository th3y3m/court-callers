using BusinessObjects;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Services;


namespace VNPAYAPI.Areas.VNPayAPI.Controllers
{
    [Area("VNPayAPI")]
    public class VnpayController : Controller
    {
        private readonly ILogger<VnpayController> _logger;
        private readonly VnpayService _vnpayService;

        public VnpayController(ILogger<VnpayController> logger, VnpayService vnpayService)
        {
            _logger = logger;
            _vnpayService = vnpayService;
        }

        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        [Route("/VNPayAPI/")]
        public ActionResult Payment(decimal amount, string infor, string orderinfor)
        {
            try
            {
                string paymentUrl = _vnpayService.CreatePaymentUrl(amount, infor, orderinfor);
                return Redirect(paymentUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Payment method");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet]
        [Route("/VNpayAPI/paymentconfirm")]
        public async Task<IActionResult> PaymentConfirm()
        {
            try
            {
                if (Request.QueryString.HasValue)
                {
                    string queryString = Request.QueryString.Value;
                    var validationResult = await _vnpayService.ValidatePaymentResponse(queryString);

                    if (validationResult.IsSuccessful)
                    {

                        return Redirect(validationResult.RedirectUrl); 
                    }
                    else
                    {
                        return Redirect(validationResult.RedirectUrl);
                    }
                }
                _logger.LogWarning("Invalid query string in PaymentConfirm");
                return Redirect("success");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in PaymentConfirm method");
                return StatusCode(500, "Internal server error");
            }
        }

    }
}

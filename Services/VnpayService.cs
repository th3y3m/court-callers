using Microsoft.Extensions.Logging;
using Repositories.Helper;
using System;
using System.Net;
using System.Web;
using BusinessObjects;
using Repositories;
using DAOs.Helper;
using DAOs.Models;


namespace Services
{
    public class VnpayService
    {
        private readonly ILogger<VnpayService> _logger;
        public string url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"; // HTTPS
        public string returnUrl = $"https://courtcaller.azurewebsites.net/VNpayAPI/paymentconfirm";
        public string tmnCode = "FKUXJX95";
        public string hashSecret = "0D3EAMNJYSY9INENB5JYP8XW2U8MD8WE";
        private readonly BookingRepository _bookingRepository;
        private readonly PaymentRepository _paymentRepository;
        public VnpayService(ILogger<VnpayService> logger,BookingRepository bookingRepository,PaymentRepository payment)
        {
            _logger = logger;
            _bookingRepository = bookingRepository;
            _paymentRepository = payment;
        }

        public string CreatePaymentUrl( decimal amount, string infor, string? orderinfor)
        {
            try
            {
                string hostName = Dns.GetHostName();
                string clientIPAddress = Dns.GetHostAddresses(hostName).GetValue(0).ToString();
                PayLib pay = new PayLib();
                var vnp_Amount = amount * 100000;
                pay.AddRequestData("vnp_Version", PayLib.VERSION);
                pay.AddRequestData("vnp_Command", "pay");
                pay.AddRequestData("vnp_TmnCode", tmnCode);
                pay.AddRequestData("vnp_Amount", vnp_Amount.ToString("0"));
                pay.AddRequestData("vnp_BankCode", "");
                pay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
                pay.AddRequestData("vnp_CurrCode", "VND");
                pay.AddRequestData("vnp_IpAddr", clientIPAddress);
                pay.AddRequestData("vnp_Locale", "vn");
                pay.AddRequestData("vnp_OrderInfo", infor);
                pay.AddRequestData("vnp_OrderType", "other");
                pay.AddRequestData("vnp_ReturnUrl", returnUrl);
                pay.AddRequestData("vnp_TxnRef", orderinfor);

                string paymentUrl = pay.CreateRequestUrl(url, hashSecret);
                return paymentUrl;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreatePaymentUrl method");
                throw;
            }
        }

       

        public async Task<PaymentStatusModel> ValidatePaymentResponse(string queryString)
        {
            try
            {
                var json = HttpUtility.ParseQueryString(queryString);
                var role = json["vnp_OrderInfo"].ToString();
                var booking = await _bookingRepository.GetBooking((json["vnp_TxnRef"]).ToString());
                string vnp_ResponseCode = json["vnp_ResponseCode"].ToString();
                string vnp_SecureHash = json["vnp_SecureHash"].ToString();
                var pos = queryString.IndexOf("&vnp_SecureHash");
                bool checkSignature = ValidateSignature(queryString.Substring(1, pos - 1), vnp_SecureHash, hashSecret);

                if (booking.Status == "true" && booking != null)
                {
                    return new PaymentStatusModel
                    {
                        IsSuccessful = false,
                        RedirectUrl = "LINK_INVALID"
                    };
                }


                //này là link đúng

                if (checkSignature && tmnCode == json["vnp_TmnCode"].ToString())
                {   
                    var bookingid = json["vnp_TxnRef"].ToString();
                   
                    if (vnp_ResponseCode == "00" && json["vnp_TransactionStatus"] == "00")
                    {
                        var payment = new Payment
                        {
                            PaymentId = "P" + GenerateId.GenerateShortBookingId(),
                            BookingId = bookingid,
                            PaymentAmount = decimal.Parse(json["vnp_Amount"])/100000,
                            PaymentDate = DateTime.Now,
                            PaymentMessage = "Complete",
                            PaymentStatus = "True",
                            PaymentSignature = json["vnp_BankTranNo"].ToString(),
                        };
                        _paymentRepository.AddPayment(payment);

                        
                        booking.Status = "Complete";
                        await _bookingRepository.SaveChangesAsync();
                        if (role == "Staff") {
                            var returnUrl = new PaymentStatusModel
                            {
                                IsSuccessful = true,
                                RedirectUrl = $"https://react-admin-lilac.vercel.app/confirm?vnp_TxnRef={json["vnp_TxnRef"].ToString()}"
                            }; 
                            return returnUrl;
                        } 
                        return new PaymentStatusModel
                        {
                            IsSuccessful = true,
                            RedirectUrl = $"https://localhost:3000/confirm?vnp_TxnRef={json["vnp_TxnRef"].ToString()}"
                        };

                    }
                    else
                    {
                        //link sai
                        var amount = decimal.Parse(json["vnp_Amount"]);
                        if (json["vnp_BankTranNo"]?.ToString() != null || json["vnp_TxnRef"]?.ToString() != null)
                        {
                            booking.Status = "Canceled";
                            _bookingRepository.UpdateBooking(booking);

                        var payment = new Payment
                        {
                            PaymentId = "P" + GenerateId.GenerateShortBookingId(),
                            BookingId = bookingid,
                            PaymentAmount = amount / 100000,
                            PaymentDate = DateTime.Now,
                            PaymentMessage = "Fail",
                            PaymentStatus = "False",
                            
                        };
                        _paymentRepository.AddPayment(payment);
                        }
                        if (role == "Staff")
                        {
                            var returnUrl = new PaymentStatusModel
                            {
                                IsSuccessful = false,
                                RedirectUrl = "https://react-admin-lilac.vercel.app/reject?vnp_TxnRef={json[\"vnp_TxnRef\"].ToString()}"
                            };
                            return returnUrl;
                        }
                        return new PaymentStatusModel
                        {
                            IsSuccessful = false,
                            RedirectUrl = "https://localhost:3000/reject?vnp_TxnRef={json[\"vnp_TxnRef\"].ToString()}"
                        };
                    }
                }
                else
                {
                    _logger.LogWarning("Signature validation failed or tmnCode mismatch");
                    return new PaymentStatusModel
                    {
                        IsSuccessful = false,
                        RedirectUrl = "LINK_INVALID" 
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ValidatePaymentResponse method");
                return new PaymentStatusModel
                {
                    IsSuccessful = false,
                    RedirectUrl = "LINK_ERROR" 
                };
            }
        }

       

        private bool ValidateSignature(string rspraw, string inputHash, string secretKey)
        {
            string myChecksum = Utils.HmacSHA512(secretKey, rspraw);
            return myChecksum.Equals(inputHash, StringComparison.InvariantCultureIgnoreCase);
        }
    }
}

require "test_helper"

class ApplicationControllerTest < ActionDispatch::IntegrationTest
  test "should allow modern browsers" do
    # Chrome 120 is modern
    get root_url, headers: { "User-Agent" => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
    assert_response :success
  end

  test "should block older browsers" do
    # Internet Explorer 11 is not modern
    get root_url, headers: { "User-Agent" => "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko" }
    assert_response :not_acceptable
  end
end

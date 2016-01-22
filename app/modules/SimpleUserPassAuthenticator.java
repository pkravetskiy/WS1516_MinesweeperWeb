package modules;

import org.pac4j.core.exception.CredentialsException;
import org.pac4j.core.profile.CommonProfile;
import org.pac4j.core.util.CommonHelper;
import org.pac4j.http.credentials.authenticator.UsernamePasswordAuthenticator;
import org.pac4j.http.credentials.UsernamePasswordCredentials;
import org.pac4j.http.profile.HttpProfile;
import java.util.HashMap;

public class SimpleUserPassAuthenticator implements UsernamePasswordAuthenticator {

  private HashMap<String, String> userPassMap = new HashMap<String, String>();

  public SimpleUserPassAuthenticator()  {
    userPassMap.put("dohahn", "1234");
    userPassMap.put("pkravetskiy", "1234");
  }

  @Override
  public void validate(final UsernamePasswordCredentials credentials) {
      if (credentials == null) {
          throwsException("No credential");
      }
      String username = credentials.getUsername();
      String password = credentials.getPassword();
      if (CommonHelper.isBlank(username)) {
          throwsException("Username cannot be blank");
      }
      if (CommonHelper.isBlank(password)) {
          throwsException("Password cannot be blank");
      }
      if (!isCredentialsValid(username, password)) {
          throwsException("Username : '" + username + "' does not match password");
      }
      final HttpProfile profile = new HttpProfile();
      profile.setId(username);
      profile.addAttribute(CommonProfile.USERNAME, username);
      credentials.setUserProfile(profile);
    }

    protected void throwsException(final String message) {
        throw new CredentialsException(message);
  }

  public boolean isCredentialsValid(String username, String password) {
    if(userPassMap.containsKey(username)) {
      if(userPassMap.get(username).equals(password))  {
        return true;
      }
    }
    return false;
  }
}

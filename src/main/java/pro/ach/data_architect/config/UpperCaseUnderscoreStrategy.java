package pro.ach.data_architect.config;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;

public class UpperCaseUnderscoreStrategy extends PropertyNamingStrategy.PropertyNamingStrategyBase
{
    /**
     * Converts camelCase to under_score and
     * visa versa.  The idea is that this
     * name strategy can be used for both
     * marshalling and unmarshaling.
     *
     * For example, "userName" would be converted to
     * "user_name" and conversely "user_name" would
     * be converted to "userName".
     *
     * @param input formatted as camelCase or under_score string
     * @return input converted to opposite format
     */
    @Override
    public String translate(String input)
    {
        if (input == null || input.length() == 0)
        {
            return input; // garbage in, garbage out
        }

        //
        // we always take the first character;
        // this preserves initial underscore
        //
        StringBuilder sb = new StringBuilder();

        final int length = input.length();
        int i = 0;

        //
        // skip initial underscores
        //
        while ((i < length) && ('_' == input.charAt(i)))
        {
            sb.append(input.charAt(i));
            i += 1;
        }

        while (i < length)
        {
            //
            // find underscores, remove and capitalize next letter
            //
            while ((i < length) && ('_' != input.charAt(i)) && !Character.isUpperCase(input.charAt(i)))
            {
                sb.append(input.charAt(i));
                i += 1;
            }

            if(i < length)
            {
                if('_' == input.charAt(i))
                {
                    // underscore to uppercase

                    //
                    // skip underscores
                    //
                    while ((i < length) && ('_' == input.charAt(i)))
                    {
                        // skip underscores
                        i += 1;
                    }

                    //
                    // capitalize
                    //
                    if (i < length)
                    {
                        sb.append(Character.toUpperCase(input.charAt(i)));
                        i += 1;
                    }
                }
                else // uppercase to unscore + lowercase
                {
                    sb.append('_');
                    sb.append(Character.toLowerCase(input.charAt(i)));
                    i += 1;
                }
            }
        }
        return sb.toString();
    }
}